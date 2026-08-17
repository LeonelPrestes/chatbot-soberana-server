import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ResourceNotFoundError } from '../errors/index.js'

export const getUserDetailsParamsSchema = z.object({
  id: z.uuid({ error: 'Id inválido!' }),
})

export const getUserDetailsResponseSchema = z.object({
  status: z.boolean(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
  }),
  message: z.string(),
  timestamp: z.string(),
})

type GetUserDetailsParams = z.infer<typeof getUserDetailsParamsSchema>

export async function getUserDetails({ id }: GetUserDetailsParams) {
  const user = await prisma.userExample.findUnique({
    where: { id },
  })

  if (!user) {
    throw new ResourceNotFoundError('Usuário não encontrado!')
  }

  return {
    id: user.id,
    name: user.fristName + ' ' + user.lastName,
    email: user.email,
    role: user.role,
  }
}
