import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import {
  deleteUserExample,
  deleteUserExampleSchema,
  deleteUserResponseSchema,
} from '../functions/EXAMPLE_Delete.js'
import { ok } from '../lib/api-response.js'

export const deleteUserExampleRoute: FastifyPluginCallbackZod = async (app) => {
  app.delete(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        description: 'Delete user',
        params: deleteUserExampleSchema,
        response: {
          200: deleteUserResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const result = await deleteUserExample({ id })

      return reply.status(200).send(ok(result, 'Usuario deletado com sucesso!'))
    },
  )
}
