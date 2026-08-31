-- CreateEnum
CREATE TYPE "tipo_usuario" AS ENUM ('estudante', 'profissional');

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
    "termos_aceitos_em" TIMESTAMP(3) NOT NULL,
    "versao_termos" TEXT NOT NULL,
    "politica_privacidade_aceita_em" TIMESTAMP(3) NOT NULL,
    "versao_politica_privacidade" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
