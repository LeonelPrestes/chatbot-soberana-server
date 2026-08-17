import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import {
  getAllUsers,
  getUsersResponseSchema,
} from '../functions/EXAMPLE_Get_All.js'
import { ok } from '../lib/api-response.js'

export const getAllUsersRoute: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/users',
    {
      schema: {
        tags: ['Users'],
        description: 'Get all users',
        response: {
          200: getUsersResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await getAllUsers()
      return reply
        .status(200)
        .send(ok(result, 'Usuários listados com sucesso!'))
    },
  )
}
