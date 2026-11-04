import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { PGlite } from '@electric-sql/pglite'

const baseline = new URL('../prisma/migrations/20260908203837_clinic_validation/migration.sql', import.meta.url)
const foundation = new URL('../prisma/migrations/20261104160000_m0_foundation/migration.sql', import.meta.url)

test('M0 preserva dados legados e impõe integridade no PostgreSQL', async () => {
  const db = new PGlite()
  try {
    await db.exec(await readFile(baseline, 'utf8'))
    await db.exec(`
      INSERT INTO users (id, nome, email, senha_hash, cpf, termos_aceitos_em,
        versao_termos, politica_privacidade_aceita_em, versao_politica_privacidade, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000001', 'Ana', 'ana@example.test', 'hash',
        '11111111111', now(), 'v1', now(), 'v1', now());
      INSERT INTO clinicas (id, user_id, nome, cidade, estado, tipo_clinica,
        fornecedor_material, forma_remuneracao, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001', 'Clínica A', 'São Paulo', 'SP',
        'propria', 'dentista', 'comissao', now());
      INSERT INTO procedimentos (id, clinica_id, nome, categoria, tempo_medio, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000002', 'Consulta', 'Consulta', 30, now());
      INSERT INTO clinica_custos (id, clinica_id, custo_fixo_6m, custo_variavel_6m,
        custo_fixo_mensal, custo_variavel_mensal, horas_efetivas_mes,
        data_vigencia, updated_at, deleted_at)
      VALUES
        ('00000000-0000-0000-0000-000000000004',
         '00000000-0000-0000-0000-000000000002', 600, 120, 100, 20, 100,
         '2026-01-01', now(), '2026-05-01'),
        ('00000000-0000-0000-0000-000000000005',
         '00000000-0000-0000-0000-000000000002', 900, 180, 150, 30, 100,
         '2026-05-01', now(), NULL);
      INSERT INTO precificacoes (id, clinica_id, user_id, clinica_custos_id,
        data_precificacao, tipo_procedimento, custo_minuto_clinico, tempo_procedimento,
        custo_materiais, custo_total, imposto, taxas, comissao, incidencias,
        tipo_lucro, lucro, custo_corrigido, preco_sugerido, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000004',
        '2026-02-01', 'Consulta', 1, 30, 10, 40, 0.1, 0, 0, 0.1,
        'margem', 0.3, 45, 70, now());
      INSERT INTO itens_precificacao (id, precificacao_id, categoria, nome, valor, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0000-000000000006', 'material', 'Luva', 12.50, now());
      INSERT INTO conversas (id, user_id, precificacao_id, titulo, data, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000006', 'Conversa', now(), now());
      INSERT INTO mensagens (id, conversa_id, remetente, conteudo,
        payload_estrutrado, data, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0000-000000000008', 'ia', 'Resultado',
        '{"custo":12}', now(), now());
    `)

    await db.exec(await readFile(foundation, 'utf8'))

    const migrated = await db.query(`
      SELECT p.procedimento_id, p.status, i.valor_unitario, m.payload_estruturado,
             old_cost.vigencia_fim, new_cost.vigencia_fim AS current_end
      FROM precificacoes p
      JOIN itens_precificacao i ON i.precificacao_id = p.id
      JOIN conversas c ON c.precificacao_id = p.id
      JOIN mensagens m ON m.conversa_id = c.id
      JOIN clinica_custos old_cost ON old_cost.id = '00000000-0000-0000-0000-000000000004'
      JOIN clinica_custos new_cost ON new_cost.id = '00000000-0000-0000-0000-000000000005'
    `)
    const row = migrated.rows[0] as Record<string, unknown>
    assert.equal(row.procedimento_id, '00000000-0000-0000-0000-000000000003')
    assert.equal(row.status, 'finalizada')
    assert.equal(Number(row.valor_unitario), 12.5)
    assert.deepEqual(row.payload_estruturado, { custo: 12 })
    assert.ok(row.vigencia_fim)
    assert.equal(row.current_end, null)

    await assert.rejects(db.query(`
      UPDATE precificacoes SET incidencias = 0.99
      WHERE id = '00000000-0000-0000-0000-000000000006'
    `), /precificacoes_percentages_check/)
    await assert.rejects(db.query(`
      UPDATE itens_precificacao SET valor_unitario = -1
      WHERE id = '00000000-0000-0000-0000-000000000007'
    `), /itens_precificacao_values_check/)
    await assert.rejects(db.query(`
      INSERT INTO clinica_custos (id, clinica_id, custo_fixo_6m, custo_variavel_6m,
        custo_fixo_mensal, custo_variavel_mensal, horas_efetivas_mes,
        data_vigencia, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000002', 0, 0, 0, 0, 100, '2026-06-01', now())
    `), /clinica_custos_one_current_per_clinic/)
    await assert.rejects(db.query(`
      INSERT INTO users (id, nome, email, senha_hash, cpf, termos_aceitos_em,
        versao_termos, politica_privacidade_aceita_em, versao_politica_privacidade, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000011', 'Outra', 'outra@example.test',
        'hash', '11111111111', now(), 'v1', now(), 'v1', now())
    `), /users_cpf_key/)

    await db.query(`
      UPDATE precificacoes SET imposto = 0.15
      WHERE id = '00000000-0000-0000-0000-000000000006'
    `)
    const audit = await db.query(`
      SELECT campo, valor_anterior, valor_novo, autor_id, origem
      FROM precificacao_auditoria WHERE campo = 'imposto'
    `)
    assert.equal(audit.rows.length, 1)
    assert.equal((audit.rows[0] as Record<string, unknown>).origem, 'manual')
    assert.equal((audit.rows[0] as Record<string, unknown>).autor_id,
      '00000000-0000-0000-0000-000000000001')

    await db.exec(`
      BEGIN;
      SET LOCAL app.change_source = 'ia';
      UPDATE itens_precificacao SET valor_unitario = 15
      WHERE id = '00000000-0000-0000-0000-000000000007';
      COMMIT;
    `)
    const itemAudit = await db.query(`
      SELECT origem, valor_anterior, valor_novo
      FROM precificacao_auditoria
      WHERE campo = 'itens_precificacao.00000000-0000-0000-0000-000000000007'
        AND origem = 'ia'
    `)
    assert.equal(itemAudit.rows.length, 1)
    assert.equal(Number((itemAudit.rows[0] as any).valor_anterior.valor_unitario), 12.5)
    assert.equal(Number((itemAudit.rows[0] as any).valor_novo.valor_unitario), 15)
  } finally {
    await db.close()
  }
})
