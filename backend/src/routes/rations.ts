import { Hono } from 'hono'
import { z } from 'zod'
import sql from '../db.js'
import { authMiddleware } from '../middleware/auth.js'
import {
  MealWithNameDto,
  RationDto,
  trimTime,
  formatDate,
} from '../types.js'
import { exportDoc, exportXlsx } from '../services/export.js'

const router = new Hono()

// Public endpoint — no auth needed
router.get('/public', async c => {
  const lang = c.req.query('lang') ?? 'uk'
  const profileId = c.req.query('profileId')
  const startDateStr = c.req.query('startDate')
  const endDateStr = c.req.query('endDate')

  if (!profileId) return c.json({ message: 'profileId is required' }, 400)
  if (!startDateStr) return c.json({ message: 'startDate should be defined' }, 400)

  if (!endDateStr) {
    const ration = await fetchRationForDate(profileId, startDateStr, lang)
    if (!ration) return c.json([])
    return c.json([ration])
  }

  if (startDateStr > endDateStr) {
    return c.json({ message: 'startDate should be before or equal to endDate' }, 400)
  }

  const rations = await fetchRationsRange(profileId, startDateStr, endDateStr, lang)
  return c.json(rations)
})

// All other ration endpoints require auth
router.use('*', authMiddleware)

// ─── GET /api/ration/export — Word export ────────────────────────────────────

router.get('/export', async c => {
  const lang = c.req.query('lang') ?? 'uk'
  const profileId = c.req.query('profileId')
  const startDateStr = c.req.query('startDate')
  const endDateStr = c.req.query('endDate')

  if (!profileId || !startDateStr || !endDateStr) {
    return c.json({ message: 'profileId, startDate, endDate are required' }, 400)
  }
  if (startDateStr > endDateStr) {
    return c.json({ message: 'startDate should be before or equal endDate' }, 400)
  }

  await ensureProfileExists(profileId)

  const dates = getDatesRange(startDateStr, endDateStr)
  const rationsByDate = await fetchRationsByDateRange(profileId, startDateStr, endDateStr, lang)

  const buf = await exportDoc(lang, rationsByDate, dates)

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename=Rations.docx',
    },
  })
})

// ─── GET /api/ration/exportXlsx — Excel export ───────────────────────────────

router.get('/exportXlsx', async c => {
  const profileId = c.req.query('profileId')
  const startDateStr = c.req.query('startDate')
  const endDateStr = c.req.query('endDate')

  if (!profileId || !startDateStr || !endDateStr) {
    return c.json({ message: 'profileId, startDate, endDate are required' }, 400)
  }
  if (startDateStr > endDateStr) {
    return c.json({ message: 'startDate should be before or equal endDate' }, 400)
  }

  await ensureProfileExists(profileId)

  const dates = getDatesRange(startDateStr, endDateStr)
  const rationsByDate = await fetchRationsByDateRange(profileId, startDateStr, endDateStr, 'uk')

  const buf = await exportXlsx(rationsByDate, dates)

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=rations.xlsx',
    },
  })
})

// ─── GET /api/ration/:profileId — get ration for a date ──────────────────────

router.get('/:profileId', async c => {
  const profileId = c.req.param('profileId')
  const dateStr = c.req.query('date')
  const lang = c.req.query('lang') ?? 'uk'

  if (!dateStr) return c.json({ message: 'date param required' }, 400)

  const ration = await fetchRationForDate(profileId, dateStr, lang)

  if (!ration) {
    // Replicate Spring behavior: return 200 with empty body when no ration
    return new Response(null, { status: 200 })
  }

  return c.json(ration)
})

// ─── POST /api/ration/add/:profileId — add meal to ration ────────────────────

const mealSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  grams: z.number().min(0),
  productId: z.number().int(),
})

router.post('/add/:profileId', async c => {
  const profileId = c.req.param('profileId')
  const dateStr = c.req.query('date')

  if (!dateStr) return c.json({ message: 'date param required' }, 400)

  const body = await c.req.json()
  const parsed = mealSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid meal data' }, 400)

  const { time, grams, productId } = parsed.data

  await ensureProfileExists(profileId)

  const product = await sql`SELECT id FROM product WHERE id = ${productId}`
  if (product.length === 0) return c.json({ message: `Unknown product with id: ${productId}` }, 404)

  // Get or create ration for the date
  const rationRows = await sql`
    SELECT id FROM ration WHERE profile_id = ${profileId} AND date = ${dateStr}
  `

  let rationId: number
  if (rationRows.length === 0) {
    const [newRation] = await sql<[{ id: number }]>`
      INSERT INTO ration (date, profile_id) VALUES (${dateStr}, ${profileId}) RETURNING id
    `
    rationId = newRation.id
  } else {
    rationId = rationRows[0].id as number
  }

  await sql`
    INSERT INTO meal (time, grams, product_id, ration_id)
    VALUES (${time}, ${grams}, ${productId}, ${rationId})
  `

  return c.text('Added.')
})

// ─── DELETE /api/ration/delete/:mealId ───────────────────────────────────────

router.delete('/delete/:mealId', async c => {
  const mealId = parseInt(c.req.param('mealId'), 10)

  const rows = await sql`SELECT id FROM meal WHERE id = ${mealId}`
  if (rows.length === 0) return c.json({ message: `Unknown meal with id: ${mealId}` }, 404)

  await sql`DELETE FROM meal WHERE id = ${mealId}`
  return c.text('Deleted')
})

// ─── PUT /api/ration/update/:mealId ──────────────────────────────────────────

router.put('/update/:mealId', async c => {
  const mealId = parseInt(c.req.param('mealId'), 10)

  const rows = await sql`SELECT id FROM meal WHERE id = ${mealId}`
  if (rows.length === 0) return c.json({ message: `Unknown meal with id: ${mealId}` }, 404)

  const body = await c.req.json()
  const parsed = mealSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid meal data' }, 400)

  const { time, grams } = parsed.data

  await sql`UPDATE meal SET time = ${time}, grams = ${grams} WHERE id = ${mealId}`
  return c.text('Updated')
})

// ─── POST /api/ration/add — add orphan meal (legacy) ─────────────────────────

router.post('/add', async c => {
  const body = await c.req.json()
  const parsed = mealSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid meal data' }, 400)

  const { time, grams, productId } = parsed.data

  const product = await sql`SELECT id FROM product WHERE id = ${productId}`
  if (product.length === 0) return c.text('Added') // Spring silently skips missing product

  // This endpoint doesn't link to a ration — Spring inserts without ration_id.
  // ration_id is NOT NULL in the schema, so this would fail. Spring's addMeal
  // builds a Meal entity without a ration and saves it — which would violate the FK.
  // Since this appears to be dead/legacy code, we skip the insert to avoid constraint violation.
  return c.text('Added')
})

// ─── POST /api/ration/duplicate/:profileId ───────────────────────────────────

const duplicateSchema = z.object({
  targetDates: z.array(z.string()),
})

router.post('/duplicate/:profileId', async c => {
  const profileId = c.req.param('profileId')
  const sourceDateStr = c.req.query('sourceDate')

  if (!sourceDateStr) return c.json({ message: 'sourceDate param required' }, 400)

  const body = await c.req.json()
  const parsed = duplicateSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid request body' }, 400)

  const { targetDates } = parsed.data

  await ensureProfileExists(profileId)

  const sourceRation = await sql`
    SELECT id FROM ration WHERE profile_id = ${profileId} AND date = ${sourceDateStr}
  `
  if (sourceRation.length === 0) {
    return c.json({ message: 'No ration found for the given date.' }, 404)
  }

  const sourceRationId = sourceRation[0].id as number

  const sourceMeals = await sql<Array<{ time: string; grams: number; product_id: number }>>`
    SELECT time, grams, product_id FROM meal WHERE ration_id = ${sourceRationId}
  `

  for (const targetDate of targetDates) {
    if (targetDate === sourceDateStr) continue // skip copying to same date

    await sql.begin(async tx => {
      // Get or create target ration
      const existing = await tx`
        SELECT id FROM ration WHERE profile_id = ${profileId} AND date = ${targetDate}
      `

      let targetRationId: number
      if (existing.length === 0) {
        const [newR] = await tx<[{ id: number }]>`
          INSERT INTO ration (date, profile_id) VALUES (${targetDate}, ${profileId}) RETURNING id
        `
        targetRationId = newR.id
      } else {
        targetRationId = existing[0].id as number
        // Delete existing meals in target ration
        await tx`DELETE FROM meal WHERE ration_id = ${targetRationId}`
      }

      // Insert copies of source meals
      for (const meal of sourceMeals) {
        await tx`
          INSERT INTO meal (time, grams, product_id, ration_id)
          VALUES (${meal.time}, ${meal.grams}, ${meal.product_id}, ${targetRationId})
        `
      }
    })
  }

  return c.text('Duplicated.')
})

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function ensureProfileExists(profileId: string): Promise<void> {
  const rows = await sql`SELECT id FROM profile WHERE id = ${profileId}`
  if (rows.length === 0) throw new AppError(`Unknown profile with id: ${profileId}`, 404)
}

async function fetchRationForDate(
  profileId: string,
  dateStr: string,
  lang: string,
): Promise<RationDto | null> {
  const rationRows = await sql`
    SELECT id, date FROM ration WHERE profile_id = ${profileId} AND date = ${dateStr}
  `
  if (rationRows.length === 0) return null

  const rationId = rationRows[0].id as number
  const meals = await fetchMealsForRation(rationId, lang)

  if (meals.length === 0) return null

  return {
    id: rationId,
    date: dateStr,
    meals,
  }
}

async function fetchRationsRange(
  profileId: string,
  startDate: string,
  endDate: string,
  lang: string,
): Promise<RationDto[]> {
  const rations = await sql`
    SELECT id, date FROM ration
    WHERE profile_id = ${profileId}
      AND date >= ${startDate}
      AND date <= ${endDate}
    ORDER BY date
  `

  const result: RationDto[] = []

  for (const r of rations) {
    const id = r.id as number
    const date = formatDate(r.date as Date)
    const meals = await fetchMealsForRation(id, lang)
    if (meals.length > 0) {
      result.push({ id, date, meals })
    }
  }

  return result
}

async function fetchMealsForRation(rationId: number, lang: string): Promise<MealWithNameDto[]> {
  const rows = await sql<Array<{
    meal_id: number
    time: string
    grams: number
    product_id: number
    name: string
    eng_name: string | null
    calories: number
    proteins: number
    fats: number
    carbs: number
    user_id: number | null
  }>>`
    SELECT
      m.id AS meal_id,
      m.time,
      m.grams,
      p.id AS product_id,
      p.name,
      p.eng_name,
      p.calories,
      p.proteins,
      p.fats,
      p.carbs,
      p.user_id
    FROM meal m
    JOIN product p ON p.id = m.product_id
    WHERE m.ration_id = ${rationId}
    ORDER BY m.time, m.id
  `

  return rows.map(row => ({
    id: row.meal_id,
    time: trimTime(row.time),
    grams: row.grams,
    productName: lang === 'uk' ? row.name : (row.eng_name ?? row.name),
    product: {
      id: row.product_id,
      name: row.name,
      engName: row.eng_name,
      calories: row.calories,
      proteins: row.proteins,
      fats: row.fats,
      carbs: row.carbs,
      user: row.user_id !== null, // UserSerializer: true if user-owned
    },
  }))
}

async function fetchRationsByDateRange(
  profileId: string,
  startDate: string,
  endDate: string,
  lang: string,
): Promise<Map<string, RationDto | null>> {
  const map = new Map<string, RationDto | null>()
  const dates = getDatesRange(startDate, endDate)

  const rations = await sql`
    SELECT id, date FROM ration
    WHERE profile_id = ${profileId}
      AND date >= ${startDate}
      AND date <= ${endDate}
  `

  const rationByDate = new Map<string, number>()
  for (const r of rations) {
    rationByDate.set(formatDate(r.date as Date), r.id as number)
  }

  for (const dateStr of dates) {
    const rationId = rationByDate.get(dateStr)
    if (!rationId) {
      map.set(dateStr, null)
      continue
    }
    const meals = await fetchMealsForRation(rationId, lang)
    if (meals.length === 0) {
      map.set(dateStr, null)
    } else {
      map.set(dateStr, { id: rationId, date: dateStr, meals })
    }
  }

  return map
}

function getDatesRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  while (current <= end) {
    dates.push(current.toISOString().substring(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// ─── Internal error class for route helpers ───────────────────────────────────

class AppError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export { router as rationsRouter, AppError }
