import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import sql from '../db.js'
import { config } from '../config.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'
import { sendEmail, buildConfirmationEmailHtml } from '../services/email.js'
import { DbUser } from '../types.js'

const router = new Hono()

// ─── Public test endpoints ────────────────────────────────────────────────────

router.get('/test', c => c.text('test'))

router.get('/test2', rateLimitMiddleware, c => c.text('test2'))

// ─── Contact form ─────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string(),
  email: z.string(),
  number: z.string().optional(),
})

router.post('/submit', rateLimitMiddleware, async c => {
  const body = await c.req.json()
  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid request' }, 400)

  const { name, email, number } = parsed.data
  try {
    await sendEmail(
      config.contactEmail,
      `DIET-DASH: New Contact Form Submission From ${name}`,
      `Name: ${name}\nEmail: ${email}\nNumber: ${number ?? ''}`,
      false,
    )
    return c.text('Message sent successfully.')
  } catch {
    return c.json({ message: 'Cannot send email' }, 400)
  }
})

// ─── Login ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
})

router.post('/login', async c => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid credentials' }, 400)

  const { login, password } = parsed.data

  const rows = await sql<DbUser[]>`
    SELECT id, first_name, last_name, login, password, enabled, user_role
    FROM app_user WHERE login = ${login}
  `
  if (rows.length === 0) return c.json({ message: 'Unknown user' }, 404)

  const user = rows[0]

  if (!user.enabled) {
    return c.json({ message: `Email ${user.login} not activated.` }, 406)
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return c.json({ message: 'Invalid password' }, 400)

  const token = await createToken(user.login)

  return c.json({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    login: user.login,
    token,
    enabled: user.enabled,
    userRole: user.user_role,
  })
})

// ─── Register ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  login: z.string().min(1),
  password: z.string().min(1),
})

router.post('/register', rateLimitMiddleware, async c => {
  const body = await c.req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid request body' }, 400)

  const { firstName, lastName, login, password } = parsed.data

  const existing = await sql`SELECT id FROM app_user WHERE login = ${login}`
  if (existing.length > 0) return c.json({ message: 'Login already exists' }, 400)

  const hashedPassword = await bcrypt.hash(password, 10)
  const confirmationToken = randomUUID()

  const [newUser] = await sql<DbUser[]>`
    INSERT INTO app_user (first_name, last_name, login, password, confirmation_token, enabled, user_role)
    VALUES (${firstName}, ${lastName}, ${login}, ${hashedPassword}, ${confirmationToken}, false, 'USER')
    RETURNING id, first_name, last_name, login, enabled, user_role
  `

  // Send confirmation email async — don't block the response
  sendEmail(
    login,
    'Diet dash (confirm).',
    buildConfirmationEmailHtml(confirmationToken, 'confirm', 'VERIFY EMAIL', config.domain),
    true,
  ).catch(err => console.error('Failed to send confirmation email:', err))

  const token = await createToken(login)

  return c.json(
    {
      id: newUser.id,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      login: newUser.login,
      token,
      enabled: newUser.enabled,
      userRole: newUser.user_role,
    },
    201,
    { Location: `/users/${newUser.id}` },
  )
})

// ─── Forgot password ──────────────────────────────────────────────────────────

router.post('/send-forgot-email', rateLimitMiddleware, async c => {
  const email = c.req.query('email')
  if (!email) return c.json({ message: 'email param required' }, 400)

  const rows = await sql<DbUser[]>`
    SELECT id, login, confirmation_token FROM app_user WHERE login = ${email}
  `
  if (rows.length === 0) return c.json({ message: 'Unknown user' }, 404)

  const user = rows[0]

  sendEmail(
    user.login,
    'Diet dash (forgot-password).',
    buildConfirmationEmailHtml(user.confirmation_token, 'forgot-password', 'CHANGE PASSWORD', config.domain),
    true,
  ).catch(err => console.error('Failed to send forgot password email:', err))

  return c.text('Ok')
})

// ─── Reset password ───────────────────────────────────────────────────────────

router.post('/update-password', async c => {
  const tokenParam = c.req.query('token')
  if (!tokenParam) return c.json({ message: 'token param required' }, 400)

  const rawPassword = await c.req.text()
  if (!rawPassword) return c.json({ message: 'password body required' }, 400)

  const rows = await sql<DbUser[]>`
    SELECT id, login, password, enabled FROM app_user WHERE confirmation_token = ${tokenParam}
  `
  if (rows.length === 0) return c.json({ message: 'Unknown user with this confirmation token' }, 404)

  const user = rows[0]

  if (!user.enabled) {
    return c.json({ message: 'Email is not activated' }, 400)
  }

  // Prevent reuse of old password (correct implementation — the Java version has a bug here)
  const isSamePassword = await bcrypt.compare(rawPassword, user.password)
  if (isSamePassword) return c.json({ message: 'Do not use old password, please.' }, 400)

  const newHash = await bcrypt.hash(rawPassword, 10)
  await sql`UPDATE app_user SET password = ${newHash} WHERE id = ${user.id}`

  return c.text('Ok')
})

// ─── Confirm email ────────────────────────────────────────────────────────────

router.post('/confirm', async c => {
  const tokenParam = c.req.query('token')
  if (!tokenParam) return c.json({ message: 'token param required' }, 400)

  const rows = await sql`
    SELECT id FROM app_user WHERE confirmation_token = ${tokenParam}
  `
  if (rows.length === 0) return c.json({ message: 'Unknown user with this confirmation token' }, 404)

  await sql`UPDATE app_user SET enabled = true WHERE confirmation_token = ${tokenParam}`

  return c.text('Ok')
})

// ─── Check new ────────────────────────────────────────────────────────────────

router.post('/checkNew', c => c.text('Check new'))

// ─── JWT helper ───────────────────────────────────────────────────────────────

async function createToken(login: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return sign(
    {
      sub: login,
      iat: now,
      exp: now + 604800, // 1 week
    },
    config.jwtSecret,
  )
}

export { router as authRouter }
