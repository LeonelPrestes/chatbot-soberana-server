import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export const getUsersResponseSchema = z.object({
  status: z.boolean(),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.string(),
    }),
  ),
  message: z.string(),
  timestamp: z.string(),
})

export async function getAllUsers() {
  const users = await prisma.userExample.findMany()

  return users.map((user) => ({
    id: user.id,
    name: user.fristName + ' ' + user.lastName,
    email: user.email,
    role: user.role,
  }))
}
