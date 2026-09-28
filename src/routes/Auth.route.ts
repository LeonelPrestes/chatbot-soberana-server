import { compare, hash } from 'bcryptjs'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ConflictError, UnauthorizedError } from '../errors/index.js'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const publicUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
})

const authResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ user: publicUserSchema, token: z.string() }),
  message: z.string().optional(),
})

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(6),
})

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2),
  passwordConfirmation: z.string().min(6).optional(),
  phone: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  userType: z.enum(['student', 'professional']).nullable().optional(),
  cro: z.string().optional().nullable(),
  termsAccepted: z.literal(true),
  privacyPolicyAccepted: z.literal(true),
  settings: z.object({
    currency: z.string().optional(),
    profitMargin: z.number().min(0).max(100).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    cardFee: z.number().min(0).max(100).optional(),
  }).optional(),
}).refine((data) => !data.passwordConfirmation || data.password === data.passwordConfirmation, {
  message: 'As senhas não coincidem',
  path: ['passwordConfirmation'],
})

const userTypeMap = {
  student: 'STUDENT',
  professional: 'PROFESSIONAL',
} as const

function toPublicUser(user: { id: string; name: string; email: string }) {
  return { id: user.id, name: user.name, email: user.email }
}

export const authRoutes: FastifyPluginCallbackZod = async (app) => {
  app.post('/auth/register', {
    schema: {
      tags: ['Authentication'],
      description: 'Create a user account and start an authenticated session.',
      body: registerSchema,
      response: { 201: authResponseSchema },
    },
  }, async (request, reply) => {
    const data = request.body
    const email = data.email
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (existing) throw new ConflictError('Já existe uma conta com este e-mail.')

    const now = new Date()
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        passwordHash: await hash(data.password, 12),
        phone: data.phone || null,
        cpf: data.cpf || null,
        cro: data.cro || null,
        userType: data.userType ? userTypeMap[data.userType] : null,
        termsAcceptedAt: now,
        termsVersion: process.env.TERMS_VERSION ?? 'v1-dev',
        privacyPolicyAcceptedAt: now,
        privacyPolicyVersion: process.env.PRIVACY_POLICY_VERSION ?? 'v1-dev',
        defaultCurrency: data.settings?.currency ?? 'BRL',
        defaultProfitMargin: data.settings?.profitMargin === undefined ? undefined : data.settings.profitMargin / 100,
        defaultTaxRate: data.settings?.taxRate === undefined ? undefined : data.settings.taxRate / 100,
        defaultCardFee: data.settings?.cardFee === undefined ? undefined : data.settings.cardFee / 100,
      },
      select: { id: true, name: true, email: true },
    })

    const token = await reply.jwtSign({ sub: user.id })
    return reply.status(201).send({ success: true, data: { user: toPublicUser(user), token } })
  })

  app.post('/auth/login', {
    schema: {
      tags: ['Authentication'],
      description: 'Authenticate a user with email and password.',
      body: credentialsSchema,
      response: { 200: authResponseSchema },
    },
  }, async (request, reply) => {
    const { email, password } = request.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedError('E-mail ou senha inválidos.')
    }

    const token = await reply.jwtSign({ sub: user.id })
    return reply.send({ success: true, data: { user: toPublicUser(user), token } })
  })

  app.get('/auth/me', {
    preHandler: [auth],
    schema: { tags: ['Authentication'], description: 'Get the authenticated user.' },
  }, async (request, reply) => {
    const user = await prisma.user.findFirst({
      where: { id: request.user.sub, deletedAt: null },
      select: { id: true, name: true, email: true },
    })
    if (!user) throw new UnauthorizedError('Sessão inválida.')
    return reply.send(toPublicUser(user))
  })
}
