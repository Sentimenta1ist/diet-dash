const required = (name: string): string => {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required environment variable: ${name}`)
  return v
}

export const config = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  mailPassword: required('MAIL_PASSWORD'),
  mailtrapApiToken: required('MAILTRAP_API_TOKEN'),
  domain: process.env.DOMAIN ?? 'diet-dash.com',
  mailtrapEndpoint: 'https://send.api.mailtrap.io/api/send',
  mailFrom: 'diet.dash.agent@gmail.com',
  contactEmail: 'ivanenko.dev@gmail.com',
}
