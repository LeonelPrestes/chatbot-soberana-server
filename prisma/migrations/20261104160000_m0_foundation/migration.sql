-- CreateEnum
CREATE TYPE "status_precificacao" AS ENUM ('rascunho', 'finalizada', 'arquivada');

-- CreateEnum
CREATE TYPE "origem_alteracao" AS ENUM ('manual', 'ia');

-- DropForeignKey
ALTER TABLE "procedimentos" DROP CONSTRAINT "procedimentos_clinica_id_fkey";

-- DropForeignKey
ALTER TABLE "itens_precificacao" DROP CONSTRAINT "itens_precificacao_precificacao_id_fkey";

-- DropForeignKey
ALTER TABLE "conversas" DROP CONSTRAINT "conversas_precificacao_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tipo_lucro_padrao" "tipo_lucro" NOT NULL DEFAULT 'margem';

-- AlterTable
ALTER TABLE "procedimentos" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "clinica_id" DROP NOT NULL,
ALTER COLUMN "categoria" DROP NOT NULL;

-- Existing clinic procedures belong to the clinic owner. NULL user_id is reserved
-- for system templates created by the seed.
UPDATE "procedimentos" AS p
SET "user_id" = c."user_id"
FROM "clinicas" AS c
WHERE p."clinica_id" = c."id";

-- AlterTable
ALTER TABLE "clinica_custos" ADD COLUMN     "vigencia_fim" DATE;

-- Older code used deleted_at to close a cost period. Convert those rows to
-- historical periods so the normal soft-delete filter will not hide history.
WITH periods AS (
  SELECT "id", LEAD("data_vigencia") OVER (
    PARTITION BY "clinica_id" ORDER BY "data_vigencia", "created_at", "id"
  ) AS next_start
  FROM "clinica_custos"
)
UPDATE "clinica_custos" AS costs
SET "vigencia_fim" = periods.next_start,
    "deleted_at" = NULL
FROM periods
WHERE costs."id" = periods."id";

-- Existing calculated rows are finalized; new rows start as drafts. Resolve
-- legacy free-text procedure names to real procedures without dropping data.
ALTER TABLE "precificacoes"
  ADD COLUMN "procedimento_id" UUID,
  ADD COLUMN "status" "status_precificacao" NOT NULL DEFAULT 'finalizada';

INSERT INTO "procedimentos" (
  "id", "user_id", "clinica_id", "nome", "categoria", "tempo_medio",
  "created_at", "updated_at", "ativo"
)
SELECT gen_random_uuid(), c."user_id", p."clinica_id", p."tipo_procedimento",
       'Migrado', MAX(p."tempo_procedimento"), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true
FROM "precificacoes" AS p
JOIN "clinicas" AS c ON c."id" = p."clinica_id"
WHERE NOT EXISTS (
  SELECT 1 FROM "procedimentos" AS existing
  WHERE existing."clinica_id" = p."clinica_id"
    AND existing."nome" = p."tipo_procedimento"
)
GROUP BY c."user_id", p."clinica_id", p."tipo_procedimento";

UPDATE "precificacoes" AS p
SET "procedimento_id" = (
  SELECT procedure."id"
  FROM "procedimentos" AS procedure
  WHERE procedure."clinica_id" = p."clinica_id"
    AND procedure."nome" = p."tipo_procedimento"
  ORDER BY procedure."created_at", procedure."id"
  LIMIT 1
);

ALTER TABLE "precificacoes"
  ALTER COLUMN "procedimento_id" SET NOT NULL,
  ALTER COLUMN "status" SET DEFAULT 'rascunho',
  DROP COLUMN "tipo_procedimento";

ALTER TABLE "precificacoes"
  ALTER COLUMN "data_precificacao" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "custo_minuto_clinico" SET DEFAULT 0,
  ALTER COLUMN "tempo_procedimento" SET DEFAULT 0,
  ALTER COLUMN "custo_materiais" SET DEFAULT 0,
  ALTER COLUMN "custo_total" SET DEFAULT 0,
  ALTER COLUMN "imposto" SET DEFAULT 0,
  ALTER COLUMN "taxas" SET DEFAULT 0,
  ALTER COLUMN "comissao" SET DEFAULT 0,
  ALTER COLUMN "incidencias" SET DEFAULT 0,
  ALTER COLUMN "tipo_lucro" SET DEFAULT 'margem',
  ALTER COLUMN "lucro" SET DEFAULT 0,
  ALTER COLUMN "custo_corrigido" SET DEFAULT 0,
  ALTER COLUMN "preco_sugerido" SET DEFAULT 0;

-- Preserve monetary values during the rename.
ALTER TABLE "itens_precificacao" RENAME COLUMN "valor" TO "valor_unitario";
ALTER TABLE "itens_precificacao"
  ADD COLUMN "origem" "origem_alteracao" NOT NULL DEFAULT 'manual';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "conversas" WHERE "precificacao_id" IS NULL) THEN
    RAISE EXCEPTION 'M0 migration: link existing conversations to a pricing before migrating';
  END IF;
END $$;
ALTER TABLE "conversas" ALTER COLUMN "precificacao_id" SET NOT NULL;

ALTER TABLE "mensagens" RENAME COLUMN "payload_estrutrado" TO "payload_estruturado";

-- CreateTable
CREATE TABLE "especialidades" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precificacao_auditoria" (
    "id" UUID NOT NULL,
    "precificacao_id" UUID NOT NULL,
    "campo" TEXT NOT NULL,
    "valor_anterior" JSONB,
    "valor_novo" JSONB,
    "autor_id" UUID,
    "origem" "origem_alteracao" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "precificacao_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_codigo_key" ON "especialidades"("codigo");
CREATE UNIQUE INDEX "especialidades_nome_key" ON "especialidades"("nome");
CREATE INDEX "especialidades_deleted_at_idx" ON "especialidades"("deleted_at");
CREATE UNIQUE INDEX "procedimentos_codigo_key" ON "procedimentos"("codigo");

-- CreateIndex
CREATE INDEX "precificacao_auditoria_precificacao_id_created_at_idx" ON "precificacao_auditoria"("precificacao_id", "created_at");

-- CreateIndex
CREATE INDEX "precificacao_auditoria_autor_id_idx" ON "precificacao_auditoria"("autor_id");

-- CreateIndex
CREATE INDEX "precificacao_auditoria_deleted_at_idx" ON "precificacao_auditoria"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "clinicas_user_id_idx" ON "clinicas"("user_id");

-- CreateIndex
CREATE INDEX "clinicas_deleted_at_idx" ON "clinicas"("deleted_at");

-- CreateIndex
CREATE INDEX "procedimentos_user_id_idx" ON "procedimentos"("user_id");

-- CreateIndex
CREATE INDEX "procedimentos_clinica_id_idx" ON "procedimentos"("clinica_id");

-- CreateIndex
CREATE INDEX "procedimentos_deleted_at_idx" ON "procedimentos"("deleted_at");

-- CreateIndex
CREATE INDEX "clinica_custos_clinica_id_idx" ON "clinica_custos"("clinica_id");

-- CreateIndex
CREATE INDEX "clinica_custos_deleted_at_idx" ON "clinica_custos"("deleted_at");

-- CreateIndex
CREATE INDEX "precificacoes_clinica_id_idx" ON "precificacoes"("clinica_id");

-- CreateIndex
CREATE INDEX "precificacoes_user_id_idx" ON "precificacoes"("user_id");

-- CreateIndex
CREATE INDEX "precificacoes_clinica_custos_id_idx" ON "precificacoes"("clinica_custos_id");

-- CreateIndex
CREATE INDEX "precificacoes_procedimento_id_idx" ON "precificacoes"("procedimento_id");

-- CreateIndex
CREATE INDEX "precificacoes_deleted_at_idx" ON "precificacoes"("deleted_at");

-- CreateIndex
CREATE INDEX "itens_precificacao_precificacao_id_idx" ON "itens_precificacao"("precificacao_id");

-- CreateIndex
CREATE INDEX "itens_precificacao_deleted_at_idx" ON "itens_precificacao"("deleted_at");

-- CreateIndex
CREATE INDEX "conversas_user_id_idx" ON "conversas"("user_id");

-- CreateIndex
CREATE INDEX "conversas_precificacao_id_idx" ON "conversas"("precificacao_id");

-- CreateIndex
CREATE INDEX "conversas_deleted_at_idx" ON "conversas"("deleted_at");

-- CreateIndex
CREATE INDEX "mensagens_conversa_id_idx" ON "mensagens"("conversa_id");

-- CreateIndex
CREATE INDEX "mensagens_deleted_at_idx" ON "mensagens"("deleted_at");

-- AddForeignKey
ALTER TABLE "procedimentos" ADD CONSTRAINT "procedimentos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimentos" ADD CONSTRAINT "procedimentos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precificacoes" ADD CONSTRAINT "precificacoes_procedimento_id_fkey" FOREIGN KEY ("procedimento_id") REFERENCES "procedimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_precificacao" ADD CONSTRAINT "itens_precificacao_precificacao_id_fkey" FOREIGN KEY ("precificacao_id") REFERENCES "precificacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_precificacao_id_fkey" FOREIGN KEY ("precificacao_id") REFERENCES "precificacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precificacao_auditoria" ADD CONSTRAINT "precificacao_auditoria_precificacao_id_fkey" FOREIGN KEY ("precificacao_id") REFERENCES "precificacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precificacao_auditoria" ADD CONSTRAINT "precificacao_auditoria_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain constraints that Prisma cannot express in schema.prisma.
ALTER TABLE "users" ADD CONSTRAINT "users_default_percentages_check" CHECK (
  ("margem_lucro_padrao" IS NULL OR "margem_lucro_padrao" BETWEEN 0 AND 1)
  AND ("aliquota_imposto_padrao" IS NULL OR "aliquota_imposto_padrao" BETWEEN 0 AND 1)
  AND ("taxa_cartao_padrao" IS NULL OR "taxa_cartao_padrao" BETWEEN 0 AND 1)
);
ALTER TABLE "clinicas" ADD CONSTRAINT "clinicas_commission_check" CHECK (
  "percentual_comissao" IS NULL OR "percentual_comissao" BETWEEN 0 AND 1
);
ALTER TABLE "clinica_custos" ADD CONSTRAINT "clinica_custos_values_check" CHECK (
  "custo_fixo_6m" >= 0 AND "custo_variavel_6m" >= 0
  AND "custo_fixo_mensal" >= 0 AND "custo_variavel_mensal" >= 0
  AND "horas_efetivas_mes" > 0
  AND ("vigencia_fim" IS NULL OR "vigencia_fim" >= "data_vigencia")
);
CREATE UNIQUE INDEX "clinica_custos_one_current_per_clinic"
  ON "clinica_custos"("clinica_id")
  WHERE "vigencia_fim" IS NULL AND "deleted_at" IS NULL;
ALTER TABLE "precificacoes" ADD CONSTRAINT "precificacoes_percentages_check" CHECK (
  "imposto" BETWEEN 0 AND 1 AND "taxas" BETWEEN 0 AND 1
  AND "comissao" BETWEEN 0 AND 1 AND "incidencias" BETWEEN 0 AND 0.95
  AND "lucro" >= 0
  AND ("tipo_lucro" <> 'margem' OR "lucro" < 0.95)
  AND "version" >= 1
);
ALTER TABLE "itens_precificacao" ADD CONSTRAINT "itens_precificacao_values_check" CHECK (
  "valor_unitario" >= 0 AND "quantidade" > 0 AND "version" >= 1
);

-- Audit all pricing and item edits at the database boundary. Application code
-- may set app.actor_id and app.change_source ('manual' or 'ia') with SET LOCAL;
-- otherwise the pricing owner and manual source are used.
CREATE FUNCTION audit_pricing_change() RETURNS trigger AS $$
DECLARE
  changed_field TEXT;
  old_row JSONB;
  new_row JSONB;
  actor UUID;
  change_origin "origem_alteracao";
  pricing UUID;
BEGIN
  change_origin := COALESCE(
    NULLIF(current_setting('app.change_source', true), '')::"origem_alteracao",
    'manual'::"origem_alteracao"
  );

  IF TG_TABLE_NAME = 'precificacoes' THEN
    actor := COALESCE(NULLIF(current_setting('app.actor_id', true), '')::UUID, NEW."user_id");
    old_row := to_jsonb(OLD) - 'updated_at';
    new_row := to_jsonb(NEW) - 'updated_at';
    FOR changed_field IN SELECT jsonb_object_keys(new_row) LOOP
      IF old_row -> changed_field IS DISTINCT FROM new_row -> changed_field THEN
        INSERT INTO "precificacao_auditoria" (
          "id", "precificacao_id", "campo", "valor_anterior", "valor_novo",
          "autor_id", "origem", "created_at", "updated_at"
        ) VALUES (
          gen_random_uuid(), NEW."id", changed_field,
          old_row -> changed_field, new_row -> changed_field,
          actor, change_origin, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
      END IF;
    END LOOP;
    RETURN NEW;
  END IF;

  pricing := CASE WHEN TG_OP = 'DELETE' THEN OLD."precificacao_id" ELSE NEW."precificacao_id" END;
  SELECT COALESCE(NULLIF(current_setting('app.actor_id', true), '')::UUID, p."user_id")
    INTO actor FROM "precificacoes" AS p WHERE p."id" = pricing;
  INSERT INTO "precificacao_auditoria" (
    "id", "precificacao_id", "campo", "valor_anterior", "valor_novo",
    "autor_id", "origem", "created_at", "updated_at"
  ) VALUES (
    gen_random_uuid(), pricing,
    'itens_precificacao.' || (CASE WHEN TG_OP = 'DELETE' THEN OLD."id" ELSE NEW."id" END)::TEXT,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    actor, change_origin, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "precificacoes_audit_update"
  AFTER UPDATE ON "precificacoes"
  FOR EACH ROW EXECUTE FUNCTION audit_pricing_change();
CREATE TRIGGER "itens_precificacao_audit_change"
  AFTER INSERT OR UPDATE OR DELETE ON "itens_precificacao"
  FOR EACH ROW EXECUTE FUNCTION audit_pricing_change();
