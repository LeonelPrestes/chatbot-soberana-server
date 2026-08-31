import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'
import { env } from '../env/env.js'
import { logger } from './logger.js'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

export const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
})

prisma.$on('query', (e) => {
  const slow = e.duration >= 200
  if (slow) {
    logger.warn({ duration: `${e.duration}ms`, query: e.query }, 'Slow query')
  } else if (env.NODE_ENV === 'dev') {
    logger.debug(
      { duration: `${e.duration}ms`, query: e.query },
      'Prisma query',
    )
  }
})

prisma.$on('warn', (e) => {
  logger.warn({ message: e.message }, 'Prisma warning')
})

prisma.$on('error', (e) => {
  logger.error({ message: e.message }, 'Prisma error')
})
