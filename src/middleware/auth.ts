import type { FastifyReply, FastifyRequest } from 'fastify'

export async function auth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (error) {
    return reply.status(401).send('TOKEN NÃO ENCONTRADO.')
  }
}
