import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import {
  createUserExample,
  createUserExampleSchema,
  createUserResponseSchema,
} from '../functions/EXAMPLE_Create.js'
import { ok } from '../lib/api-response.js'

export const createUserExampleRoute: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        description: 'Create a new individual user',
        body: createUserExampleSchema,
        response: {
          201: createUserResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const data = request.body

      const result = await createUserExample(data)

      return reply.status(201).send(ok(result, 'Usuario criado com sucesso!'))
    },
  )
}
