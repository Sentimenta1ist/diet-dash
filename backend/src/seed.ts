import { createReadStream, existsSync } from 'fs'
import { createInterface } from 'readline'
import { join } from 'path'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import sql from './db.js'
import { config } from './config.js'

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

async function createTables(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS app_user (
      id                 SERIAL       PRIMARY KEY,
      first_name         VARCHAR(255) NOT NULL,
      last_name          VARCHAR(255) NOT NULL,
      login              VARCHAR(255) NOT NULL UNIQUE,
      password           VARCHAR(255) NOT NULL,
      confirmation_token VARCHAR(255),
      enabled            BOOLEAN      NOT NULL DEFAULT false,
      user_role          VARCHAR(50)  NOT NULL DEFAULT 'USER'
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS profile (
      id                       VARCHAR(36)  PRIMARY KEY,
      name                     VARCHAR(255),
      age                      INTEGER      NOT NULL DEFAULT 0,
      gender                   VARCHAR(10),
      height                   NUMERIC      NOT NULL DEFAULT 0,
      weight                   NUMERIC      NOT NULL DEFAULT 0,
      waist                    NUMERIC      NOT NULL DEFAULT 0,
      hips                     NUMERIC      NOT NULL DEFAULT 0,
      goal_weight              NUMERIC      NOT NULL DEFAULT 0,
      activity                 SMALLINT     NOT NULL DEFAULT 0,
      body_mass_index          NUMERIC      NOT NULL DEFAULT 0,
      daily_calorie_norm       NUMERIC      NOT NULL DEFAULT 0,
      selected_calorie_limit   NUMERIC      NOT NULL DEFAULT 0,
      daily_protein_limit      NUMERIC      NOT NULL DEFAULT 0,
      daily_fat_limit          NUMERIC      NOT NULL DEFAULT 0,
      daily_carbs_limit        NUMERIC      NOT NULL DEFAULT 0,
      daily_protein_percentage NUMERIC      NOT NULL DEFAULT 0,
      daily_fat_percentage     NUMERIC      NOT NULL DEFAULT 0,
      daily_carbs_percentage   NUMERIC      NOT NULL DEFAULT 0,
      user_id                  INTEGER      REFERENCES app_user(id) ON DELETE CASCADE
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS product (
      id       SERIAL       PRIMARY KEY,
      name     VARCHAR(255) NOT NULL,
      eng_name VARCHAR(255),
      calories NUMERIC      NOT NULL DEFAULT 0,
      proteins NUMERIC      NOT NULL DEFAULT 0,
      fats     NUMERIC      NOT NULL DEFAULT 0,
      carbs    NUMERIC      NOT NULL DEFAULT 0,
      user_id  INTEGER      REFERENCES app_user(id) ON DELETE CASCADE
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS ration (
      id         SERIAL      PRIMARY KEY,
      date       DATE        NOT NULL,
      profile_id VARCHAR(36) REFERENCES profile(id) ON DELETE CASCADE
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS meal (
      id         SERIAL  PRIMARY KEY,
      time       TIME    NOT NULL,
      grams      NUMERIC NOT NULL DEFAULT 0,
      product_id INTEGER REFERENCES product(id),
      ration_id  INTEGER REFERENCES ration(id) ON DELETE CASCADE
    )
  `
}

async function seedProducts(): Promise<number> {
  const [{ count }] = await sql<[{ count: string }]>`
    SELECT COUNT(*)::text AS count FROM product WHERE user_id IS NULL
  `
  if (parseInt(count, 10) > 0) return 0

  const csvPath = join(process.cwd(), 'data', 'main_data.csv')
  if (!existsSync(csvPath)) {
    console.warn(`[seed] main_data.csv not found at ${csvPath}, skipping product seeding`)
    return 0
  }

  type Row = { name: string; eng_name: string; calories: number; proteins: number; fats: number; carbs: number; user_id: null }
  let batch: Row[] = []
  let total = 0
  const BATCH_SIZE = 500

  const flush = async () => {
    if (batch.length === 0) return
    await sql`INSERT INTO product ${sql(batch, 'name', 'eng_name', 'calories', 'proteins', 'fats', 'carbs', 'user_id')}`
    total += batch.length
    batch = []
  }

  const rl = createInterface({ input: createReadStream(csvPath), crlfDelay: Infinity })
  for await (const line of rl) {
    const parts = line.split(',')
    if (parts.length < 6) continue
    const eng_name = capitalize(parts[0].trim())
    const name = capitalize(parts[1].trim())
    const calories = parseFloat(parts[2].trim())
    const proteins = parseFloat(parts[3].trim())
    const fats = parseFloat(parts[4].trim())
    const carbs = parseFloat(parts[5].trim())
    if (isNaN(calories) || isNaN(proteins) || isNaN(fats) || isNaN(carbs)) continue
    batch.push({ name, eng_name, calories, proteins, fats, carbs, user_id: null })
    if (batch.length >= BATCH_SIZE) await flush()
  }
  await flush()

  return total
}

async function seedTestUser(): Promise<boolean> {
  if (!config.testUserPassword) return false
  const existing = await sql`SELECT id FROM app_user WHERE login = 'test@dietdash.com'`
  if (existing.length > 0) return false

  const hashedPassword = await bcrypt.hash(config.testUserPassword, 10)
  const confirmationToken = randomUUID()

  const [{ id: userId }] = await sql<[{ id: number }]>`
    INSERT INTO app_user (first_name, last_name, login, password, confirmation_token, enabled, user_role)
    VALUES ('Test', 'User', 'test@dietdash.com', ${hashedPassword}, ${confirmationToken}, true, 'PRO')
    RETURNING id
  `

  const profileId = randomUUID()
  await sql`
    INSERT INTO profile (
      id, name, age, gender, height, weight, waist, hips, goal_weight,
      activity, body_mass_index, daily_calorie_norm, selected_calorie_limit,
      daily_protein_limit, daily_fat_limit, daily_carbs_limit,
      daily_protein_percentage, daily_fat_percentage, daily_carbs_percentage,
      user_id
    ) VALUES (
      ${profileId}, 'Default', 25, 'MALE', 175, 70, 80, 95, 70,
      1, 22.9, 2200, 2200, 165, 73, 275,
      30, 30, 40,
      ${userId}
    )
  `

  return true
}

export async function seed(): Promise<void> {
  console.log('[seed] Creating tables...')
  await createTables()
  console.log('[seed] Tables ready.')

  const productsInserted = await seedProducts()
  if (productsInserted > 0) {
    console.log(`[seed] Inserted ${productsInserted} products.`)
  }

  const userCreated = await seedTestUser()
  console.log(
    userCreated
      ? '[seed] Test user created: test@dietdash.com'
      : '[seed] Test user skipped (exists or TEST_USER_PASSWORD not set).',
  )
}
