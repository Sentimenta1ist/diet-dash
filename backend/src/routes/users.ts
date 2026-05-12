import { Hono } from 'hono'
import sql from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = new Hono()

router.use('*', authMiddleware)

// GET /api/users/plan — returns "Premium" or "Free plan"
router.get('/plan', async c => {
  const user = c.get('user')

  const rows = await sql`
    SELECT user_role FROM app_user WHERE login = ${user.login}
  `
  if (rows.length === 0) return c.json({ message: 'Unknown user' }, 404)

  const role = rows[0].user_role as string
  return c.text(role === 'PRO' ? 'Premium' : 'Free plan')
})

export { router as usersRouter }
