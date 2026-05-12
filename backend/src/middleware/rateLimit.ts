import { Context, Next } from 'hono'

const MAX_REQUESTS_PER_WINDOW = 3
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes

interface Entry {
  count: number
  resetAt: number
}

// Replicates Caffeine cache with expireAfterWrite(5min) and maximumSize(10_000)
const cache = new Map<string, Entry>()
let cacheSize = 0
const MAX_CACHE_SIZE = 10_000

function evictExpired() {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (now >= entry.resetAt) {
      cache.delete(key)
      cacheSize--
    }
  }
}

export function rateLimitMiddleware(c: Context, next: Next) {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    ?? c.req.header('x-real-ip')
    ?? 'unknown'

  const now = Date.now()
  let entry = cache.get(ip)

  if (!entry || now >= entry.resetAt) {
    if (entry) {
      cacheSize-- // replacing expired entry
    } else if (cacheSize >= MAX_CACHE_SIZE) {
      // LRU-style eviction: clear all expired entries
      evictExpired()
      if (cacheSize >= MAX_CACHE_SIZE) {
        // Still full — evict oldest by deleting first entry (FIFO approximation)
        const firstKey = cache.keys().next().value
        if (firstKey !== undefined) {
          cache.delete(firstKey)
          cacheSize--
        }
      }
    }
    entry = { count: 0, resetAt: now + WINDOW_MS }
    cache.set(ip, entry)
    cacheSize++
  }

  entry.count++

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return c.text('Too many requests. Please try again later.', 429)
  }

  return next()
}
