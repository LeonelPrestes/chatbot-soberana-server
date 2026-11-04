import assert from 'node:assert/strict'
import test from 'node:test'
import { ok, fail } from '../src/lib/api-response.js'
import { scopeSoftDeletedQuery } from '../src/lib/soft-delete.js'

test('helpers retornam envelope com timestamp ISO e dados preservados', () => {
  const success = ok({ value: 12 }, 'feito')
  const failure = fail('erro', { field: 'invalid' })
  assert.deepEqual({ status: success.status, data: success.data, message: success.message }, {
    status: true, data: { value: 12 }, message: 'feito',
  })
  assert.deepEqual({ status: failure.status, data: failure.data, message: failure.message }, {
    status: false, data: { field: 'invalid' }, message: 'erro',
  })
  assert.equal(new Date(success.timestamp).toISOString(), success.timestamp)
  assert.equal(new Date(failure.timestamp).toISOString(), failure.timestamp)
})

test('leituras do Prisma filtram soft delete por padrão e aceitam filtro explícito', () => {
  const base = { where: { userId: 'owner' } }
  assert.deepEqual(scopeSoftDeletedQuery('Clinic', 'findMany', base), {
    where: { userId: 'owner', deletedAt: null },
  })
  assert.deepEqual(base, { where: { userId: 'owner' } })
  assert.deepEqual(scopeSoftDeletedQuery('Pricing', 'count', { where: {} }), {
    where: { deletedAt: null },
  })
  assert.deepEqual(scopeSoftDeletedQuery('Clinic', 'findMany', { where: { deletedAt: { not: null } } }), {
    where: { deletedAt: { not: null } },
  })
  assert.deepEqual(scopeSoftDeletedQuery('Clinic', 'create', base), base)
})

test('rota de saúde responde no envelope e plugin Prisma está registrado', async () => {
  process.env.DATABASE_URL = 'postgresql://audit:audit@localhost:5432/audit'
  process.env.JWT_SECRET = 'test-secret'
  process.env.JWT_EXPIRES = '7d'
  process.env.IA_API_KEY = 'test-key'
  const { app } = await import('../src/app.js')
  try {
    const response = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(response.statusCode, 200)
    const body = response.json()
    assert.equal(body.status, true)
    assert.equal(typeof body.data.uptime, 'number')
    assert.equal(new Date(body.timestamp).toISOString(), body.timestamp)
    assert.ok(app.prisma)
  } finally {
    await app.close()
  }
})
