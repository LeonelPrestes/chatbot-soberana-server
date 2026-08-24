import pino from 'pino'
import { env } from '../env/env.js'

const isDev = env.NODE_ENV === 'dev'

export const logger = pino(
  isDev
    ? {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
      }
    : {
        level: 'info',
        redact: {
          paths: [
            'req.headers.authorization',
            'req.body.password',
            'req.body.token',
          ],
          censor: '[REDACTED]',
        },
      },
)
