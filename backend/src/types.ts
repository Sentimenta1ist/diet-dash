// ─── DB row types (snake_case matches column names) ──────────────────────────

export interface DbUser {
  id: number
  first_name: string
  last_name: string
  login: string
  password: string
  confirmation_token: string
  enabled: boolean
  user_role: 'USER' | 'PRO'
}

export interface DbProfile {
  id: string
  name: string
  age: number
  gender: string
  height: number
  weight: number
  waist: number
  hips: number
  goal_weight: number
  activity: number // 0-5 stored as SMALLINT
  body_mass_index: number
  daily_calorie_norm: number
  selected_calorie_limit: number
  daily_protein_limit: number
  daily_fat_limit: number
  daily_carbs_limit: number
  daily_protein_percentage: number
  daily_fat_percentage: number
  daily_carbs_percentage: number
  user_id: number
}

export interface DbProduct {
  id: number
  name: string
  eng_name: string | null
  calories: number
  proteins: number
  fats: number
  carbs: number
  user_id: number | null
}

export interface DbRation {
  id: number
  date: Date
  profile_id: string
}

export interface DbMeal {
  id: number
  time: string // "HH:MM:SS" from PostgreSQL TIME
  grams: number
  product_id: number
  ration_id: number
}

// ─── Response / DTO types ─────────────────────────────────────────────────────

export interface UserDto {
  id: number
  firstName: string
  lastName: string
  login: string
  token?: string
  enabled: boolean
  userRole: 'USER' | 'PRO'
}

export interface ActivityDto {
  id: number
  description: string
  multiplier: number
}

export interface ProfileDto {
  name: string
  age: number
  gender: string
  height: number
  weight: number
  waist: number
  hips: number
  goalWeight: number
  activity: ActivityDto | null
  bodyMassIndex: number
  dailyCalorieNorm: number
  selectedCalorieLimit: number
  dailyProteinLimit: number
  dailyFatLimit: number
  dailyCarbsLimit: number
  dailyProteinPercentage: number
  dailyFatPercentage: number
  dailyCarbsPercentage: number
}

export interface ProfileNameDto {
  id: string
  name: string
}

export interface SimpleProfileDto {
  id: string
  name: string
  age: number
  gender: string
  height: number
  weight: number
  selectedCalorieLimit: number
}

export interface ProductResponse {
  id: number
  name: string
  calories: number
  proteins: number
  fats: number
  carbs: number
  created: boolean
}

export interface MealWithNameDto {
  id: number
  time: string // "HH:mm"
  grams: number
  productName: string
  product: {
    id: number
    name: string
    engName: string | null
    calories: number
    proteins: number
    fats: number
    carbs: number
    user: boolean // true if user-created, false if base product (matches UserSerializer)
  }
}

export interface RationDto {
  id: number
  date: string // "yyyy-MM-dd"
  meals: MealWithNameDto[]
}

export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: { empty: boolean; sorted: boolean; unsorted: boolean }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalElements: number
  totalPages: number
  first: boolean
  size: number
  number: number
  sort: { empty: boolean; sorted: boolean; unsorted: boolean }
  numberOfElements: number
  empty: boolean
}

export interface ErrorDto {
  message: string
}

// ─── Activity lookup table ────────────────────────────────────────────────────

export const ACTIVITIES = [
  { id: 0, ua: 'Без врахування навантаження (ООВ * 1)', en: 'Without physical activity (BMR * 1)', multiplier: 1.0 },
  { id: 1, ua: 'Сидячий спосіб життя (ООВ * 1.2)', en: 'Sedentary lifestyle (BMR * 1.2)', multiplier: 1.2 },
  { id: 2, ua: 'Мала активність (ООВ * 1.375)', en: 'Low activity (BMR * 1.375)', multiplier: 1.375 },
  { id: 3, ua: 'Помірна активність (ООВ * 1.55)', en: 'Moderate activity (BMR * 1.55)', multiplier: 1.55 },
  { id: 4, ua: 'Висока активність (ООВ * 1.725)', en: 'High activity (BMR * 1.725)', multiplier: 1.725 },
  { id: 5, ua: 'Дуже висока активність (ООВ * 1.9)', en: 'Very high activity (BMR * 1.9)', multiplier: 1.9 },
] as const

export function activityToDto(id: number | null | undefined, lang: string): ActivityDto | null {
  if (id == null) return null
  const act = ACTIVITIES.find(a => a.id === id)
  if (!act) return null
  return {
    id: act.id,
    description: lang === 'en' ? act.en : act.ua,
    multiplier: act.multiplier,
  }
}

// ─── Pagination helper ────────────────────────────────────────────────────────

export function buildPage<T>(
  content: T[],
  page: number,
  size: number,
  totalElements: number,
): PageResponse<T> {
  const totalPages = size === 0 ? 1 : Math.ceil(totalElements / size)
  const sort = { empty: true, sorted: false, unsorted: true }
  return {
    content,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort,
      offset: page * size,
      paged: true,
      unpaged: false,
    },
    last: page >= totalPages - 1,
    totalElements,
    totalPages,
    first: page === 0,
    size,
    number: page,
    sort,
    numberOfElements: content.length,
    empty: content.length === 0,
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/** Trims PostgreSQL TIME string "HH:MM:SS" to "HH:mm" */
export function trimTime(t: string): string {
  return t.substring(0, 5)
}

/** Formats a Date (from postgres DATE column) to "yyyy-MM-dd" */
export function formatDate(d: Date): string {
  return d.toISOString().substring(0, 10)
}
