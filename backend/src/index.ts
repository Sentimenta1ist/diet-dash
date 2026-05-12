import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from './config.js'
import { authRouter } from './routes/auth.js'
import { usersRouter } from './routes/users.js'
import { profilesRouter } from './routes/profiles.js'
import { productsRouter } from './routes/products.js'
import { rationsRouter, AppError } from './routes/rations.js'
import { seed } from './seed.js'

const app = new Hono()

// CORS — mirrors WebConfig.java: all origins, all headers, all methods,
// exposes Content-Disposition + Content-Type for file downloads
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['*'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Disposition', 'Content-Type'],
    maxAge: 3600,
  }),
)

// ─── Routes ───────────────────────────────────────────────────────────────────

app.route('/api/auth', authRouter)
app.route('/api/users', usersRouter)
app.route('/api/profile', profilesRouter)
app.route('/api/products', productsRouter)
app.route('/api/ration', rationsRouter)

app.get('/api/health', c => c.json({ status: 'ok' }))

// Charts endpoint (stub — original returns random data; kept for API compatibility)
app.get('/api/charts/main', c => {
  const currentDate = new Date('2025-04-04')
  const result = []
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  for (let i = -3; i <= 3; i++) {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + i)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    result.push({
      date: `${dd}.${mm}.${yyyy}`,
      clients: random(20, 40),
      diets: random(10, 25),
    })
  }

  return c.json(result)
})

// ─── Global error handler ─────────────────────────────────────────────────────

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ message: err.message }, err.status as 400 | 404 | 402 | 500)
  }
  console.error('Unhandled error:', err)
  return c.json({ message: 'Internal server error' }, 500)
})

app.notFound(c => c.json({ message: 'Not found' }, 404))

// ─── Start server ─────────────────────────────────────────────────────────────

seed()
  .then(() => {
    serve(
      {
        fetch: app.fetch,
        port: config.port,
      },
      info => {
        console.log(`Diet Dash backend running on port ${info.port}`)
      },
    )
  })
  .catch(err => {
    console.error('Startup seed failed:', err)
    process.exit(1)
  })
