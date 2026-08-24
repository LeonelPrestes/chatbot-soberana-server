import { FastifyError, FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { AppError, ValidationError } from './index.js'
import { fail } from '../lib/api-response.js'

export function errorHandler(app: FastifyInstance) {
  app.setErrorHandler<FastifyError>((error, _request, reply) => {
    if (error.code === 'FST_ERR_VALIDATION' && error.validation) {
      const fields = Object.fromEntries(
        error.validation.map((e) => [
          e.instancePath.replace('/', ''),
          e.message,
        ]),
      )
      return reply.status(400).send(fail('Erro de validação', fields))
    }

    if (
      error.code?.startsWith('FST_') &&
      error.statusCode &&
      error.statusCode < 500
    ) {
      return reply.status(error.statusCode).send(fail(error.message))
    }

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

    if (error instanceof ValidationError) {
      return reply
        .status(error.statusCode)
        .send(fail(error.message, error.fields ?? null))
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(fail(error.message))
    }

    app.log.error({ err: error }, 'Unhandled error')
    return reply.status(500).send(fail('Erro interno inesperado'))
  })
}
