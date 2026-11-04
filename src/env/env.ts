import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8081),
  DATABASE_URL: z.url().startsWith('postgresql://'),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES: z.string().regex(/^\d+[smhd]$/, 'use um valor como 15m, 12h ou 7d'),
  IA_API_KEY: z.string().min(1),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const fields = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
  throw new Error(`Configuração de ambiente inválida: ${fields}`)
}

const env = parsed.data

export { env }
