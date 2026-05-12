import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import { config } from '../config.js'
import sql from '../db.js'
import { DbUser, UserDto } from '../types.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: UserDto
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const token = parts[1]

  try {
    const payload = await verify(token, config.jwtSecret, 'HS256')
    const login = payload.sub as string

    const rows = await sql<DbUser[]>`
      SELECT id, first_name, last_name, login, enabled, user_role, confirmation_token, password
      FROM app_user
      WHERE login = ${login}
    `

    if (rows.length === 0) {
      return c.json({ message: 'Unknown user' }, 404)
    }

    const user = rows[0]

    if (!user.enabled) {
      return c.json({ message: 'Email is not activated' }, 406)
    }

    const userDto: UserDto = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      login: user.login,
      enabled: user.enabled,
      userRole: user.user_role,
    }

    c.set('user', userDto)
    await next()
  } catch {
    return c.json({ message: 'Unauthorized' }, 401)
  }
}
