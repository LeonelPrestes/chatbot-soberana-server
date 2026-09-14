-- CreateEnum
CREATE TYPE "tipo_usuario" AS ENUM ('estudante', 'profissional');

-- CreateEnum
CREATE TYPE "tipo_clinica" AS ENUM ('propria', 'terceirizada');

-- CreateEnum
CREATE TYPE "fornecedor_material" AS ENUM ('dentista', 'clinica');

-- CreateEnum
CREATE TYPE "forma_remuneracao" AS ENUM ('comissao', 'aluguel_mensal', 'valor_fixo');

-- CreateEnum
CREATE TYPE "tipo_lucro" AS ENUM ('markup', 'margem');

-- CreateEnum
CREATE TYPE "categoria_item" AS ENUM ('material', 'comissao', 'imposto', 'gasto_adicional', 'outro');

-- CreateEnum
CREATE TYPE "remetente" AS ENUM ('user', 'ia');

-- CreateEnum
CREATE TYPE "status_mensagem" AS ENUM ('pendente', 'confirmado', 'rejeitado');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "email_verificado_em" TIMESTAMP(3),
    "telefone" TEXT,
    "cpf" TEXT,
    "especialidade" TEXT,
    "tipo_usuario" "tipo_usuario",
    "cidade" TEXT,
    "estado" TEXT,
    "cro" TEXT,
    "estado_cro" TEXT,
    "moeda_padrao" TEXT DEFAULT 'BRL',
    "tempo_atendimento_padrao" INTEGER,
    "margem_lucro_padrao" DECIMAL(5,4),
    "aliquota_imposto_padrao" DECIMAL(5,4),
    "taxa_cartao_padrao" DECIMAL(5,4),
    "termos_aceitos_em" TIMESTAMP(3) NOT NULL,
    "versao_termos" TEXT NOT NULL,
    "politica_privacidade_aceita_em" TIMESTAMP(3) NOT NULL,
    "versao_politica_privacidade" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinicas" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "endereco" TEXT,
    "tipo_clinica" "tipo_clinica" NOT NULL,
    "fornecedor_material" "fornecedor_material" NOT NULL,
    "forma_remuneracao" "forma_remuneracao" NOT NULL,
    "percentual_comissao" DECIMAL(5,4),
    "valor_aluguel_sala" DECIMAL(12,2),
    "outras_despesas_recorrentes" DECIMAL(12,2),
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedimentos" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tempo_medio" INTEGER,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "procedimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinica_custos" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "custo_fixo_6m" DECIMAL(12,2) NOT NULL,
    "custo_variavel_6m" DECIMAL(12,2) NOT NULL,
    "custo_fixo_mensal" DECIMAL(12,2) NOT NULL,
    "custo_variavel_mensal" DECIMAL(12,2) NOT NULL,
    "horas_efetivas_mes" DECIMAL(6,2) NOT NULL,
    "data_vigencia" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clinica_custos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precificacoes" (
    "id" UUID NOT NULL,
    "clinica_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "clinica_custos_id" UUID NOT NULL,
    "data_precificacao" DATE NOT NULL,
    "tipo_procedimento" TEXT NOT NULL,
    "custo_minuto_clinico" DECIMAL(12,4) NOT NULL,
    "tempo_procedimento" INTEGER NOT NULL,
    "custo_materiais" DECIMAL(12,2) NOT NULL,
    "custo_adicional" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "custo_total" DECIMAL(12,2) NOT NULL,
    "imposto" DECIMAL(5,4) NOT NULL,
    "taxas" DECIMAL(5,4) NOT NULL,
    "comissao" DECIMAL(5,4) NOT NULL,
    "incidencias" DECIMAL(5,4) NOT NULL,
    "tipo_lucro" "tipo_lucro" NOT NULL,
    "lucro" DECIMAL(5,4) NOT NULL,
    "custo_corrigido" DECIMAL(12,2) NOT NULL,
    "preco_sugerido" DECIMAL(12,2) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "precificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_precificacao" (
    "id" UUID NOT NULL,
    "precificacao_id" UUID NOT NULL,
    "categoria" "categoria_item" NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "itens_precificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "precificacao_id" UUID,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" UUID NOT NULL,
    "conversa_id" UUID NOT NULL,
    "remetente" "remetente" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "payload_estrutrado" JSONB,
    "status" "status_mensagem" NOT NULL DEFAULT 'pendente',
    "data" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "clinicas" ADD CONSTRAINT "clinicas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimentos" ADD CONSTRAINT "procedimentos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinica_custos" ADD CONSTRAINT "clinica_custos_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precificacoes" ADD CONSTRAINT "precificacoes_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precificacoes" ADD CONSTRAINT "precificacoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precificacoes" ADD CONSTRAINT "precificacoes_clinica_custos_id_fkey" FOREIGN KEY ("clinica_custos_id") REFERENCES "clinica_custos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_precificacao" ADD CONSTRAINT "itens_precificacao_precificacao_id_fkey" FOREIGN KEY ("precificacao_id") REFERENCES "precificacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_precificacao_id_fkey" FOREIGN KEY ("precificacao_id") REFERENCES "precificacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "conversas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
