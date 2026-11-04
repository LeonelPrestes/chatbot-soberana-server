import { hash } from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const specialties = [
  { code: 'clinica-geral', name: 'Clínica Geral' },
  { code: 'endodontia', name: 'Endodontia' },
  { code: 'ortodontia', name: 'Ortodontia' },
  { code: 'periodontia', name: 'Periodontia' },
  { code: 'protese-dentaria', name: 'Prótese Dentária' },
]

const procedures = [
  { code: 'consulta', name: 'Consulta odontológica', category: 'Consulta', averageTime: 30 },
  { code: 'profilaxia', name: 'Profilaxia', category: 'Prevenção', averageTime: 45 },
  { code: 'restauracao', name: 'Restauração', category: 'Dentística', averageTime: 60 },
  { code: 'endodontia', name: 'Tratamento endodôntico', category: 'Endodontia', averageTime: 90 },
  { code: 'extracao-simples', name: 'Extração simples', category: 'Cirurgia', averageTime: 60 },
]

async function main() {
  for (const specialty of specialties) {
    await prisma.specialty.upsert({
      where: { code: specialty.code },
      create: specialty,
      update: { name: specialty.name, active: true, deletedAt: null },
    })
  }

  for (const procedure of procedures) {
    await prisma.procedure.upsert({
      where: { code: procedure.code },
      create: { ...procedure, userId: null, clinicId: null },
      update: { ...procedure, userId: null, clinicId: null, active: true, deletedAt: null },
    })
  }

  const email = process.env.DEV_USER_EMAIL?.trim().toLowerCase()
  const password = process.env.DEV_USER_PASSWORD
  if (Boolean(email) !== Boolean(password)) {
    throw new Error('Defina DEV_USER_EMAIL e DEV_USER_PASSWORD juntos para criar usuário local.')
  }

  if (email && password) {
    if (password.length < 6) throw new Error('DEV_USER_PASSWORD deve ter pelo menos 6 caracteres.')
    const now = new Date()
    const name = process.env.DEV_USER_NAME ?? 'Usuário de Desenvolvimento'
    const passwordHash = await hash(password, 12)
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
      update: { name, passwordHash, deletedAt: null },
    })
    console.info(`Usuário local disponível: ${email}`)
  }

  console.info(`Seed concluído: ${specialties.length} especialidades e ${procedures.length} procedimentos padrão.`)
}

try {
  await main()
} finally {
  await prisma.$disconnect()
}
