import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'

import { ok } from '../lib/api-response.js'
import {
  updateUser,
  updateUserResponseSchema,
  updateUserSchema,
} from '../functions/EXAMPLE_Update.js'

export const updateUserRoute: FastifyPluginCallbackZod = async (app) => {
  app.patch(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        description: 'Update user',
        params: updateUserSchema.pick({ id: true }),
        body: updateUserSchema.omit({ id: true }).partial(),
        response: {
          200: updateUserResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const result = await updateUser({ id }, request.body)
      return reply
        .status(200)
        .send(ok(result, 'Usuário atualizado com sucesso!'))
    },
  )
}
