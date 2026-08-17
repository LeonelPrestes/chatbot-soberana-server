import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ResourceNotFoundError } from '../errors/index.js'

export const deleteUserResponseSchema = z.object({
  status: z.boolean(),
  data: z.object({
    name: z.string(),
  }),
  message: z.string(),
  timestamp: z.string(),
})

export const deleteUserExampleSchema = z.object({
  id: z.uuid({ error: 'Id invalido!' }),
})

type deleteUserExample = z.infer<typeof deleteUserExampleSchema>

export async function deleteUserExample({ id }: deleteUserExample) {
  const user = await prisma.userExample.findUnique({
    where: { id },
  })
  if (!user) {
    throw new ResourceNotFoundError('Usuario não encontrado!')
  }

  await prisma.userExample.delete({
    where: { id },
  })

  return {
    name: user.fristName + ' ' + user.lastName,
  }
}
