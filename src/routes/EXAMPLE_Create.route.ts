import { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import {
  createUserExample,
  createUserExampleSchema,
  createUserResponseSchema,
} from '../functions/EXAMPLE_Create.js'
import { ok } from '../lib/api-response.js'

// no app.post vai 3 parametos
// 1 -> a url do endpoint, usar uma por padrão para os cruds. Ex.: todas as rotas de users é /users, so mudando os parametros e metodos http
// 2 -> tipagem do swagger -> swagger é uma documentação de endpoint para o front usar ->
// tags = o nome da pasta que essa rota ta. Ex.: Rotas de users na pasta Users
// Description = Umas breve descrição do que a rota faz
// body = oque o front tem que enviar, basicamente o schema criado la na função
// response = oque a api vai responde, somente a resposta positiva a de erro ja esta tipada no handler global
// 3 -> a função padrão do fastify
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
