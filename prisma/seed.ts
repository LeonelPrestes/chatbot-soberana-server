import { hash } from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const email = process.env.DEV_USER_EMAIL?.trim().toLowerCase()
const password = process.env.DEV_USER_PASSWORD
const name = process.env.DEV_USER_NAME ?? 'Usuário de Desenvolvimento'

if (!email || !password) {
  throw new Error('Defina DEV_USER_EMAIL e DEV_USER_PASSWORD no .env antes de executar o seed.')
}

if (password.length < 6) {
  throw new Error('DEV_USER_PASSWORD deve ter pelo menos 6 caracteres.')
}

const now = new Date()
const passwordHash = await hash(password, 12)

try {
  await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      passwordHash,
      userType: 'PROFESSIONAL',
      termsAcceptedAt: now,
      termsVersion: process.env.TERMS_VERSION ?? 'v1-dev',
      privacyPolicyAcceptedAt: now,
      privacyPolicyVersion: process.env.PRIVACY_POLICY_VERSION ?? 'v1-dev',
    },
    update: {
      name,
      passwordHash,
      deletedAt: null,
    },
  })

  console.info(`Usuário local disponível: ${email}`)
} finally {
  await prisma.$disconnect()
}
