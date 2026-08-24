import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { AppError, ValidationError } from './index.js'
import { fail } from '../lib/api-response.js'

//Aqui onde os erros serão capturados automaticamente
export function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      const fields = Object.fromEntries(
        error.issues.map((e) => [e.path.join('.'), e.message]),
      )
      return reply.status(400).send(fail('Erro de validação', fields))
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return reply.status(409).send(fail('Registro duplicado'))
    }

    if (error instanceof AppError) {
      const data =
        error instanceof ValidationError ? (error.fields ?? null) : null
      return reply.status(error.statusCode).send(fail(error.message, data))
    }

    console.error(error)
    return reply.status(500).send(fail('Erro interno inesperado'))
  })
}
