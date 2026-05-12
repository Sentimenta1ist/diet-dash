import { Hono } from 'hono'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import sql from '../db.js'
import { authMiddleware } from '../middleware/auth.js'
import {
  DbProfile,
  ProfileDto,
  ProfileNameDto,
  SimpleProfileDto,
  activityToDto,
  buildPage,
  ACTIVITIES,
} from '../types.js'

const router = new Hono()

router.use('*', authMiddleware)

// ─── GET /api/profile — list of ProfileNameDto (optionally filtered by term) ──

router.get('/', async c => {
  const term = c.req.query('term')
  const user = c.get('user')

  const profiles = await sql<DbProfile[]>`
    SELECT id, name FROM profile WHERE user_id = ${user.id}
    ORDER BY name
  `

  const filtered = term
    ? profiles.filter(p => p.name?.toLowerCase().includes(term.toLowerCase()))
    : profiles

  const result: ProfileNameDto[] = filtered.map(p => ({ id: p.id, name: p.name }))
  return c.json(result)
})

// ─── GET /api/profile/activities ──────────────────────────────────────────────

router.get('/activities', c => {
  const lang = c.req.query('lang') ?? 'en'
  const result = ACTIVITIES.map(a => ({
    id: a.id,
    description: lang === 'en' ? a.en : a.ua,
    multiplier: a.multiplier,
  }))
  return c.json(result)
})

// ─── GET /api/profile/list — paginated SimpleProfileDto ──────────────────────

router.get('/list', async c => {
  const page = parseInt(c.req.query('page') ?? '0', 10)
  const size = parseInt(c.req.query('size') ?? '10', 10)
  const term = c.req.query('term')
  const user = c.get('user')

  const allProfiles = await sql<DbProfile[]>`
    SELECT id, name, age, gender, height, weight, selected_calorie_limit
    FROM profile
    WHERE user_id = ${user.id}
    ORDER BY name
  `

  const filtered = term
    ? allProfiles.filter(p => p.name?.toLowerCase().includes(term.toLowerCase()))
    : allProfiles

  const total = filtered.length
  const offset = page * size
  const slice = offset >= total ? [] : filtered.slice(offset, offset + size)

  const content: SimpleProfileDto[] = slice.map(p => ({
    id: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    height: parseFloat(p.height as unknown as string) || 0,
    weight: parseFloat(p.weight as unknown as string) || 0,
    selectedCalorieLimit: parseFloat(p.selected_calorie_limit as unknown as string) || 0,
  }))

  return c.json(buildPage(content, page, size, total))
})

// ─── GET /api/profile/:id ────────────────────────────────────────────────────

router.get('/:id', async c => {
  const id = c.req.param('id')
  const lang = c.req.query('lang') ?? 'en'

  const rows = await sql<DbProfile[]>`SELECT * FROM profile WHERE id = ${id}`
  if (rows.length === 0) return c.json({ message: `Unknown profile with id: ${id}` }, 404)

  const p = rows[0]
  const dto: ProfileDto = {
    name: p.name,
    age: p.age,
    gender: p.gender,
    height: parseFloat(p.height as unknown as string) || 0,
    weight: parseFloat(p.weight as unknown as string) || 0,
    waist: parseFloat(p.waist as unknown as string) || 0,
    hips: parseFloat(p.hips as unknown as string) || 0,
    goalWeight: parseFloat(p.goal_weight as unknown as string) || 0,
    activity: activityToDto(p.activity, lang),
    bodyMassIndex: parseFloat(p.body_mass_index as unknown as string) || 0,
    dailyCalorieNorm: parseFloat(p.daily_calorie_norm as unknown as string) || 0,
    selectedCalorieLimit: parseFloat(p.selected_calorie_limit as unknown as string) || 0,
    dailyProteinLimit: parseFloat(p.daily_protein_limit as unknown as string) || 0,
    dailyFatLimit: parseFloat(p.daily_fat_limit as unknown as string) || 0,
    dailyCarbsLimit: parseFloat(p.daily_carbs_limit as unknown as string) || 0,
    dailyProteinPercentage: parseFloat(p.daily_protein_percentage as unknown as string) || 0,
    dailyFatPercentage: parseFloat(p.daily_fat_percentage as unknown as string) || 0,
    dailyCarbsPercentage: parseFloat(p.daily_carbs_percentage as unknown as string) || 0,
  }

  return c.json(dto)
})

// ─── POST /api/profile — create profile ──────────────────────────────────────

const profileBodySchema = z.object({
  name: z.string().optional(),
  age: z.number().int().optional().default(0),
  gender: z.string().optional(),
  height: z.number().int().optional().default(0),
  weight: z.number().optional().default(0),
  waist: z.number().int().optional().default(0),
  hips: z.number().int().optional().default(0),
  goalWeight: z.number().int().optional().default(0),
  activity: z.number().int().min(0).max(5).optional().default(0),
  bodyMassIndex: z.number().optional().default(0),
  dailyCalorieNorm: z.number().int().optional().default(0),
  selectedCalorieLimit: z.number().int().optional().default(0),
  dailyProteinLimit: z.number().int().optional().default(0),
  dailyFatLimit: z.number().int().optional().default(0),
  dailyCarbsLimit: z.number().int().optional().default(0),
  dailyProteinPercentage: z.number().optional().default(0),
  dailyFatPercentage: z.number().optional().default(0),
  dailyCarbsPercentage: z.number().optional().default(0),
})

router.post('/', async c => {
  const user = c.get('user')

  // PRO check: free users can only have 1 profile
  if (user.userRole === 'USER') {
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM profile WHERE user_id = ${user.id}
    `
    if (parseInt(count, 10) > 0) {
      return c.json({ message: 'Only PRO users can create more than 1 profile' }, 402)
    }
  }

  const body = await c.req.json()
  const parsed = profileBodySchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid profile data' }, 400)

  const d = parsed.data
  const newId = randomUUID()

  await sql`
    INSERT INTO profile (
      id, name, age, gender, height, weight, waist, hips, goal_weight,
      activity, body_mass_index, daily_calorie_norm, selected_calorie_limit,
      daily_protein_limit, daily_fat_limit, daily_carbs_limit,
      daily_protein_percentage, daily_fat_percentage, daily_carbs_percentage,
      user_id
    ) VALUES (
      ${newId}, ${d.name ?? null}, ${d.age}, ${d.gender ?? null}, ${d.height},
      ${d.weight}, ${d.waist}, ${d.hips}, ${d.goalWeight},
      ${d.activity}, ${d.bodyMassIndex}, ${d.dailyCalorieNorm}, ${d.selectedCalorieLimit},
      ${d.dailyProteinLimit}, ${d.dailyFatLimit}, ${d.dailyCarbsLimit},
      ${d.dailyProteinPercentage}, ${d.dailyFatPercentage}, ${d.dailyCarbsPercentage},
      ${user.id}
    )
  `

  return c.json(newId)
})

// ─── PUT /api/profile/:id — full update ──────────────────────────────────────

router.put('/:id', async c => {
  const id = c.req.param('id')

  const existing = await sql`SELECT id, user_id FROM profile WHERE id = ${id}`
  if (existing.length === 0) return c.json({ message: `Unknown profile with id: ${id}` }, 404)

  const body = await c.req.json()
  const parsed = profileBodySchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid profile data' }, 400)

  const d = parsed.data

  await sql`
    UPDATE profile SET
      name = ${d.name ?? null},
      age = ${d.age},
      gender = ${d.gender ?? null},
      height = ${d.height},
      weight = ${d.weight},
      waist = ${d.waist},
      hips = ${d.hips},
      goal_weight = ${d.goalWeight},
      activity = ${d.activity},
      body_mass_index = ${d.bodyMassIndex},
      daily_calorie_norm = ${d.dailyCalorieNorm},
      selected_calorie_limit = ${d.selectedCalorieLimit},
      daily_protein_limit = ${d.dailyProteinLimit},
      daily_fat_limit = ${d.dailyFatLimit},
      daily_carbs_limit = ${d.dailyCarbsLimit},
      daily_protein_percentage = ${d.dailyProteinPercentage},
      daily_fat_percentage = ${d.dailyFatPercentage},
      daily_carbs_percentage = ${d.dailyCarbsPercentage}
    WHERE id = ${id}
  `

  return c.text('Updated')
})

// ─── PATCH /api/profile/:id — partial update ─────────────────────────────────

const profilePatchSchema = z.object({
  name: z.string().optional(),
  age: z.number().int().optional(),
  gender: z.string().optional(),
  height: z.number().int().optional(),
  weight: z.number().optional(),
  waist: z.number().int().optional(),
  hips: z.number().int().optional(),
  goalWeight: z.number().int().optional(),
  activity: z.number().int().min(0).max(5).optional(),
  bodyMassIndex: z.number().optional(),
  dailyCalorieNorm: z.number().int().optional(),
  selectedCalorieLimit: z.number().int().optional(),
  dailyProteinLimit: z.number().int().optional(),
  dailyFatLimit: z.number().int().optional(),
  dailyCarbsLimit: z.number().int().optional(),
  dailyProteinPercentage: z.number().optional(),
  dailyFatPercentage: z.number().optional(),
  dailyCarbsPercentage: z.number().optional(),
})

router.patch('/:id', async c => {
  const id = c.req.param('id')

  const existing = await sql<DbProfile[]>`SELECT * FROM profile WHERE id = ${id}`
  if (existing.length === 0) return c.json({ message: `Unknown profile with id: ${id}` }, 404)

  const body = await c.req.json()
  const parsed = profilePatchSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid patch data' }, 400)

  const p = existing[0]
  const d = parsed.data

  await sql`
    UPDATE profile SET
      name               = ${d.name                ?? p.name},
      age                = ${d.age                 ?? p.age},
      gender             = ${d.gender              ?? p.gender},
      height             = ${d.height              ?? p.height},
      weight             = ${d.weight              ?? p.weight},
      waist              = ${d.waist               ?? p.waist},
      hips               = ${d.hips                ?? p.hips},
      goal_weight        = ${d.goalWeight           ?? p.goal_weight},
      activity           = ${d.activity             ?? p.activity},
      body_mass_index    = ${d.bodyMassIndex         ?? p.body_mass_index},
      daily_calorie_norm = ${d.dailyCalorieNorm      ?? p.daily_calorie_norm},
      selected_calorie_limit = ${d.selectedCalorieLimit ?? p.selected_calorie_limit},
      daily_protein_limit    = ${d.dailyProteinLimit    ?? p.daily_protein_limit},
      daily_fat_limit        = ${d.dailyFatLimit        ?? p.daily_fat_limit},
      daily_carbs_limit      = ${d.dailyCarbsLimit      ?? p.daily_carbs_limit},
      daily_protein_percentage = ${d.dailyProteinPercentage ?? p.daily_protein_percentage},
      daily_fat_percentage     = ${d.dailyFatPercentage     ?? p.daily_fat_percentage},
      daily_carbs_percentage   = ${d.dailyCarbsPercentage   ?? p.daily_carbs_percentage}
    WHERE id = ${id}
  `

  return c.text('Updated')
})

// ─── DELETE /api/profile/:id ──────────────────────────────────────────────────

router.delete('/:id', async c => {
  const id = c.req.param('id')

  const existing = await sql`SELECT id FROM profile WHERE id = ${id}`
  if (existing.length === 0) return c.json({ message: `Unknown profile with id: ${id}` }, 404)

  await sql`DELETE FROM profile WHERE id = ${id}`

  return c.text('Deleted')
})

export { router as profilesRouter }
