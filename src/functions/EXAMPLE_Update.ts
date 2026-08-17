import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ResourceNotFoundError } from '../errors/index.js'

export const updateUserSchema = z.object({
  id: z.uuid({ error: 'Id inválido!' }),
  fristName: z.string({ error: 'Nome inválido!' }).min(2),
  lastName: z.string({ error: 'Sobrenome inválido!' }).min(2),
  email: z.email({ error: 'Email inválido!' }),
})

export const updateUserParamsSchema = updateUserSchema.pick({ id: true })
export const updateUserBodySchema = updateUserSchema
  .omit({ id: true })
  .partial()

export const updateUserResponseSchema = z.object({
  status: z.boolean(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  message: z.string(),
  timestamp: z.string(),
})

type UpdateUserParams = z.infer<typeof updateUserParamsSchema>
type UpdateUserBody = z.infer<typeof updateUserBodySchema>

export async function updateUser(
  { id }: UpdateUserParams,
  data: UpdateUserBody,
) {
  const user = await prisma.userExample.findUnique({
    where: { id },
  })

  if (!user) {
    throw new ResourceNotFoundError('Usuário não encontrado!')
  }

  const updated = await prisma.userExample.update({
    where: { id },
    data,
  })

  return {
    id: updated.id,
    name: updated.fristName + ' ' + updated.lastName,
    email: updated.email,
  }
}
