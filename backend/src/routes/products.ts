import { Hono } from 'hono'
import { z } from 'zod'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { join } from 'path'
import sql from '../db.js'
import { authMiddleware } from '../middleware/auth.js'
import { DbProduct, ProductResponse, buildPage } from '../types.js'

const router = new Hono()

router.use('*', authMiddleware)

// CSV expected at process.cwd()/data/main_data.csv (copied during Docker build)
const CSV_PATH = join(process.cwd(), 'data', 'main_data.csv')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toProductResponse(p: DbProduct, lang: string): ProductResponse {
  return {
    id: p.id,
    name: lang === 'en' ? (p.eng_name ?? p.name) : p.name,
    calories: p.calories,
    proteins: p.proteins,
    fats: p.fats,
    carbs: p.carbs,
    created: p.user_id !== null,
  }
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// ─── GET /api/products — paginated products (base + user's own) ───────────────

router.get('/', async c => {
  const page = parseInt(c.req.query('page') ?? '0', 10)
  const size = parseInt(c.req.query('size') ?? '20', 10)
  const lang = c.req.query('lang') ?? 'en'
  const term = c.req.query('term')
  const user = c.get('user')
  const offset = page * size

  let rows: DbProduct[]
  let total: number

  if (!term || term.trim() === '') {
    rows = await sql<DbProduct[]>`
      SELECT id, name, eng_name, calories, proteins, fats, carbs, user_id
      FROM product
      WHERE user_id IS NULL OR user_id = ${user.id}
      ORDER BY id
      LIMIT ${size} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM product WHERE user_id IS NULL OR user_id = ${user.id}
    `
    total = parseInt(count, 10)
  } else if (lang === 'en') {
    rows = await sql<DbProduct[]>`
      SELECT id, name, eng_name, calories, proteins, fats, carbs, user_id
      FROM product
      WHERE (user_id IS NULL OR user_id = ${user.id})
        AND LOWER(eng_name) LIKE LOWER(${'%' + term + '%'})
      ORDER BY id
      LIMIT ${size} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM product
      WHERE (user_id IS NULL OR user_id = ${user.id})
        AND LOWER(eng_name) LIKE LOWER(${'%' + term + '%'})
    `
    total = parseInt(count, 10)
  } else {
    rows = await sql<DbProduct[]>`
      SELECT id, name, eng_name, calories, proteins, fats, carbs, user_id
      FROM product
      WHERE (user_id IS NULL OR user_id = ${user.id})
        AND LOWER(name) LIKE LOWER(${'%' + term + '%'})
      ORDER BY id
      LIMIT ${size} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM product
      WHERE (user_id IS NULL OR user_id = ${user.id})
        AND LOWER(name) LIKE LOWER(${'%' + term + '%'})
    `
    total = parseInt(count, 10)
  }

  return c.json(buildPage(rows.map(p => toProductResponse(p, lang)), page, size, total))
})

// ─── GET /api/products/created — user's own products ─────────────────────────

router.get('/created', async c => {
  const page = parseInt(c.req.query('page') ?? '0', 10)
  const size = parseInt(c.req.query('size') ?? '20', 10)
  const lang = c.req.query('lang') ?? 'en'
  const term = c.req.query('term')
  const user = c.get('user')
  const offset = page * size

  let rows: DbProduct[]
  let total: number

  if (!term || term.trim() === '') {
    rows = await sql<DbProduct[]>`
      SELECT id, name, eng_name, calories, proteins, fats, carbs, user_id
      FROM product WHERE user_id = ${user.id}
      ORDER BY id
      LIMIT ${size} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM product WHERE user_id = ${user.id}
    `
    total = parseInt(count, 10)
  } else {
    rows = await sql<DbProduct[]>`
      SELECT id, name, eng_name, calories, proteins, fats, carbs, user_id
      FROM product
      WHERE user_id = ${user.id}
        AND LOWER(name) LIKE LOWER(${'%' + term + '%'})
      ORDER BY id
      LIMIT ${size} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM product
      WHERE user_id = ${user.id}
        AND LOWER(name) LIKE LOWER(${'%' + term + '%'})
    `
    total = parseInt(count, 10)
  }

  return c.json(buildPage(rows.map(p => toProductResponse(p, lang)), page, size, total))
})

// ─── GET /api/products/base — base (global) products only ────────────────────

router.get('/base', async c => {
  const page = parseInt(c.req.query('page') ?? '0', 10)
  const size = parseInt(c.req.query('size') ?? '20', 10)
  const lang = c.req.query('lang') ?? 'en'
  const term = c.req.query('term')
  const offset = page * size

  let rows: DbProduct[]
  let total: number

  if (!term || term.trim() === '') {
    rows = await sql<DbProduct[]>`
      SELECT id, name, eng_name, calories, proteins, fats, carbs, user_id
      FROM product WHERE user_id IS NULL
      ORDER BY id
      LIMIT ${size} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM product WHERE user_id IS NULL
    `
    total = parseInt(count, 10)
  } else if (lang === 'en') {
    rows = await sql<DbProduct[]>`
      SELECT id, name, eng_name, calories, proteins, fats, carbs, user_id
      FROM product
      WHERE user_id IS NULL
        AND LOWER(eng_name) LIKE LOWER(${'%' + term + '%'})
      ORDER BY id
      LIMIT ${size} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM product
      WHERE user_id IS NULL
        AND LOWER(eng_name) LIKE LOWER(${'%' + term + '%'})
    `
    total = parseInt(count, 10)
  } else {
    rows = await sql<DbProduct[]>`
      SELECT id, name, eng_name, calories, proteins, fats, carbs, user_id
      FROM product
      WHERE user_id IS NULL
        AND LOWER(name) LIKE LOWER(${'%' + term + '%'})
      ORDER BY id
      LIMIT ${size} OFFSET ${offset}
    `
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM product
      WHERE user_id IS NULL
        AND LOWER(name) LIKE LOWER(${'%' + term + '%'})
    `
    total = parseInt(count, 10)
  }

  return c.json(buildPage(rows.map(p => toProductResponse(p, lang)), page, size, total))
})

// ─── POST /api/products — create product (PRO only) ──────────────────────────

const productSchema = z.object({
  name: z.string().min(1),
  calories: z.number().optional().default(0),
  proteins: z.number().optional().default(0),
  fats: z.number().optional().default(0),
  carbs: z.number().optional().default(0),
})

router.post('/', async c => {
  const user = c.get('user')

  if (user.userRole !== 'PRO') {
    return c.json({ message: 'Only PRO users can add own products' }, 402)
  }

  const body = await c.req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) return c.json({ message: 'Invalid product data' }, 400)

  const { name, calories, proteins, fats, carbs } = parsed.data

  // Spring sets both name and engName to product.getName() (same value)
  await sql`
    INSERT INTO product (name, eng_name, calories, proteins, fats, carbs, user_id)
    VALUES (${name}, ${name}, ${calories}, ${proteins}, ${fats}, ${carbs}, ${user.id})
  `

  return c.text('Product added')
})

// ─── POST /api/products/fill — bulk-import from CSV ──────────────────────────

router.post('/fill', async c => {
  fillFromCsv().catch(err => console.error('Fill error:', err))
  return c.text('Filling started.', 202)
})

async function fillFromCsv(): Promise<void> {
  const rl = createInterface({
    input: createReadStream(CSV_PATH),
    crlfDelay: Infinity,
  })

  type Row = { name: string; eng_name: string; calories: number; proteins: number; fats: number; carbs: number }
  let batch: Row[] = []
  const BATCH_SIZE = 1000

  const flushBatch = async () => {
    if (batch.length === 0) return
    // Use individual inserts inside a transaction for type safety (null user_id)
    await sql.begin(async tx => {
      for (const row of batch) {
        await tx`
          INSERT INTO product (name, eng_name, calories, proteins, fats, carbs, user_id)
          VALUES (${row.name}, ${row.eng_name}, ${row.calories}, ${row.proteins}, ${row.fats}, ${row.carbs}, NULL)
        `
      }
    })
    batch = []
  }

  for await (const line of rl) {
    const parts = line.split(',')
    if (parts.length < 6) continue

    try {
      const eng_name = capitalize(parts[0].trim())
      const name = capitalize(parts[1].trim())
      const calories = parseFloat(parts[2].trim())
      const proteins = parseFloat(parts[3].trim())
      const fats = parseFloat(parts[4].trim())
      const carbs = parseFloat(parts[5].trim())

      if (isNaN(calories) || isNaN(proteins) || isNaN(fats) || isNaN(carbs)) continue

      batch.push({ name, eng_name, calories, proteins, fats, carbs })

      if (batch.length >= BATCH_SIZE) {
        await flushBatch()
      }
    } catch {
      // skip malformed lines
    }
  }

  await flushBatch()
  console.log('Filled.')
}

export { router as productsRouter }
