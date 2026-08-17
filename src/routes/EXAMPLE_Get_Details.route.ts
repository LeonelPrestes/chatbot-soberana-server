import {
  getUserDetailsParamsSchema,
  getUserDetailsResponseSchema,
} from './../functions/EXAMPLE_Get_Details.js'
import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { getUserDetails } from '../functions/EXAMPLE_Get_Details.js'
import { ok } from '../lib/api-response.js'

export const getUserDetailsRoute: FastifyPluginCallbackZod = async (app) => {
  app.get(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        description: 'Get user details',
        params: getUserDetailsParamsSchema,
        response: {
          200: getUserDetailsResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const result = await getUserDetails({ id })
      return reply.status(200).send(ok(result, 'Usuário encontrado!'))
    },
  )
}
