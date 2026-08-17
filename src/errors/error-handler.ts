import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { AppError, ValidationError } from './index.js'
import { fail } from '../lib/api-response.js'

export function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    // Zod — equivalente ao MethodArgumentNotValidException
    if (error instanceof ZodError) {
      const fields = Object.fromEntries(
        error.issues.map((e) => [e.path.join('.'), e.message]),
      )
      return reply.status(400).send(fail('Erro de validação', fields))
    }

    // Prisma unique constraint — equivalente ao DuplicateRecordException
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return reply.status(409).send(fail('Registro duplicado'))
    }

    // Erros da aplicação — usa o statusCode definido em cada classe
    if (error instanceof AppError) {
      const data = error instanceof ValidationError ? (error.fields ?? null) : null
      return reply.status(error.statusCode).send(fail(error.message, data))
    }

    // Fallback — equivalente ao @ExceptionHandler(Exception.class)
    console.error(error)
    return reply.status(500).send(fail('Erro interno inesperado'))
  })
}
