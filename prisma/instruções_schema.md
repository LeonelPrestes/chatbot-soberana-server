# Pasta `prisma`

Esta pasta concentra a configuracao do Prisma no projeto. O Prisma e a ferramenta que liga o backend TypeScript ao banco PostgreSQL.

Aqui ficam principalmente:

- `schema.prisma`: arquivo principal onde descrevemos o banco.
- `migrations/`: pasta gerada quando criamos migrations.
- outros arquivos de apoio do Prisma, quando necessario.

No projeto atual, ainda existe o arquivo `prisma.config.ts` na raiz do projeto. Ele aponta para o schema:

```ts
schema: 'prisma/schema.prisma'
```

Tambem define que a URL do banco vem da variavel:

```env
DATABASE_URL
```

## Para que serve o `schema.prisma`

O `schema.prisma` e a "fonte da verdade" da estrutura do banco dentro do projeto.

Nele definimos:

- qual banco sera usado;
- onde o Prisma Client sera gerado;
- enums, quando um campo so pode aceitar valores fechados;
- models, que representam tabelas do banco;
- campos de cada tabela;
- relacionamentos entre tabelas;
- nomes reais das tabelas e colunas no banco.

O Prisma le esse arquivo para:

1. gerar migrations;
2. criar ou alterar tabelas no banco;
3. gerar o Prisma Client usado no codigo TypeScript.

## Configuracoes principais do schema

### `generator client`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

Essa configuracao diz ao Prisma como gerar o client que sera usado pelo backend.

No projeto, o client sera gerado em:

```text
generated/prisma
```

Esse codigo gerado nao deve ser escrito manualmente. Ele e recriado com:

```powershell
pnpm exec prisma generate
```

### `datasource db`

```prisma
datasource db {
  provider = "postgresql"
}
```

Essa configuracao diz que o banco usado pelo projeto e PostgreSQL.

A URL de conexao nao fica diretamente nesse arquivo. Ela vem do `prisma.config.ts`, usando a variavel `DATABASE_URL` do `.env`.

Exemplo:

```env
DATABASE_URL="postgresql://docker:docker@localhost:5452/mydb?schema=public"
```

## O que sao models

Um `model` representa uma tabela do banco.

Exemplo:

```prisma
model User {
  id    String @id @default(uuid()) @db.Uuid
  name  String
  email String @unique
}
```

Esse model representa uma tabela de usuarios com `id`, `name` e `email`.

Depois de criar uma migration, o Prisma transforma esse model em SQL e cria a tabela no PostgreSQL.

## Como criar um model

Antes de criar um model, responda:

- essa informacao precisa ser salva?
- ela pertence a qual usuario ou entidade?
- quais campos sao obrigatorios?
- quais campos podem ser opcionais?
- existe algum campo com valores fechados?
- existe dinheiro envolvido?
- a tabela precisa de `created_at`, `updated_at` e `deleted_at`?

Depois disso, crie o model no `schema.prisma`.

Exemplo seguindo o padrao do projeto:

```prisma
model User {
  id           String @id @default(uuid()) @db.Uuid
  name         String @map("nome")
  email        String @unique
  passwordHash String @map("senha_hash")

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}
```

## Campos obrigatorios e opcionais

No Prisma, campo obrigatorio nao usa `?`.

```prisma
name String
```

Campo opcional usa `?`.

```prisma
phone String?
```

No banco, campo opcional aceita `NULL`.

Isso e importante para cadastro progressivo. No projeto Soberana, telefone, CPF, especialidade, tipo de usuario, cidade e estado podem comecar vazios.

## Enums

Use `enum` quando um campo so puder aceitar valores definidos.

Exemplo do projeto:

```prisma
enum UserType {
  STUDENT      @map("estudante")
  PROFESSIONAL @map("profissional")

  @@map("tipo_usuario")
}
```

No codigo TypeScript, usamos:

```ts
UserType.STUDENT
```

No banco, o valor salvo pode ser:

```text
estudante
```

## `@map` e `@@map`

No TypeScript usamos camelCase:

```ts
passwordHash
createdAt
```

No banco usamos snake_case:

```sql
senha_hash
created_at
```

Para ligar os dois nomes, usamos `@map`:

```prisma
passwordHash String @map("senha_hash")
```

Para definir o nome real da tabela no banco, usamos `@@map`:

```prisma
@@map("users")
```

Assim, no codigo o model se chama `User`, mas no banco a tabela se chama `users`.

## Tipos financeiros

Valores de dinheiro nao devem usar `Float` ou `Double`.

Use `Decimal`:

```prisma
valorAluguel Decimal? @map("valor_aluguel") @db.Decimal(12, 2)
```

Isso evita erros de arredondamento em valores financeiros.

## Campos de controle

As principais tabelas devem ter:

```prisma
createdAt DateTime  @default(now()) @map("created_at")
updatedAt DateTime  @updatedAt @map("updated_at")
deletedAt DateTime? @map("deleted_at")
```

Significado:

- `createdAt`: quando o registro foi criado.
- `updatedAt`: quando o registro foi atualizado pela ultima vez.
- `deletedAt`: usado para exclusao logica.

Exclusao logica significa marcar um registro como excluido sem apagar fisicamente do banco.

## Como usar o schema

Sempre que criar ou alterar models, use este fluxo:

```powershell
pnpm exec prisma format
pnpm exec prisma migrate dev --name nome_da_migration
pnpm exec prisma generate
pnpm exec tsc --noEmit
```

### `prisma format`

Formata o `schema.prisma`.

```powershell
pnpm exec prisma format
```

### `prisma migrate dev`

Cria uma migration e aplica no banco local.

```powershell
pnpm exec prisma migrate dev --name create_users
```

O nome deve explicar a alteracao.

Exemplos:

```text
create_users
create_estabelecimentos
add_phone_to_users
make_cpf_optional
```

### `prisma generate`

Gera ou atualiza o Prisma Client.

```powershell
pnpm exec prisma generate
```

Depois disso, o codigo TypeScript consegue usar:

```ts
prisma.user.findMany()
prisma.user.create()
prisma.user.findUnique()
prisma.user.update()
```

### `tsc --noEmit`

Valida se o TypeScript continua correto.

```powershell
pnpm exec tsc --noEmit
```

## O que e uma migration

Migration e o registro de uma mudanca no banco.

Exemplo:

```text
Antes: banco sem tabela users
Depois: banco com tabela users
```

Essa mudanca vira uma migration.

Quando rodamos:

```powershell
pnpm exec prisma migrate dev --name create_users
```

O Prisma:

1. compara o schema atual com o estado anterior;
2. gera uma pasta dentro de `prisma/migrations`;
3. cria um arquivo SQL;
4. aplica esse SQL no banco;
5. registra no banco que aquela migration ja foi executada;
6. atualiza o Prisma Client.

A pasta `migrations` deve ir para o Git, porque ela permite que todos os alunos tenham o mesmo banco.

## Cuidados ao alterar models

### Obrigatorio para opcional

Geralmente e simples.

```prisma
phone String
```

vira:

```prisma
phone String?
```

O banco passa a aceitar `NULL`.

### Opcional para obrigatorio

Pode dar erro se ja existirem registros vazios.

```prisma
phone String?
```

vira:

```prisma
phone String
```

Antes de fazer isso, e preciso preencher os registros antigos ou definir uma estrategia.

### Renomear campos

Se for mudar apenas o nome usado no codigo, mantenha o mesmo `@map`.

```prisma
cellphone String? @map("telefone")
```

Assim o codigo usa `cellphone`, mas o banco continua usando a coluna `telefone`.

Se mudar o nome da coluna no banco sem cuidado, o Prisma pode gerar uma migration que apaga a coluna antiga e cria outra, causando perda de dados.

### Remover campos

Remover um campo pode gerar `DROP COLUMN`, apagando dados.

Antes de remover, confirme se os dados realmente nao serao mais usados.

### Alterar tipo de campo

Mudar tipo pode exigir conversao.

Exemplo:

```prisma
phone String?
```

para:

```prisma
phone Int?
```

Se houver texto salvo, a conversao pode falhar.

## Fluxo geral do Prisma no projeto

```text
schema.prisma
   |
   v
prisma format
   |
   v
prisma migrate dev
   |
   v
banco PostgreSQL e atualizado
   |
   v
prisma generate
   |
   v
backend usa Prisma Client
   |
   v
tsc valida os tipos
```

## Estado atual da pasta `prisma`

O schema atual inclui usuários, especialidades, clínicas, custos com vigência,
procedimentos do usuário e do sistema, precificações, itens, conversas,
mensagens e auditoria. As migrations versionadas ficam em
`prisma/migrations/`; a migration de fundação M0 acrescenta índices,
restrições SQL, vigência única de custos e gatilhos de auditoria.

Use `npm run db:deploy` para aplicar as migrations existentes,
`npm run db:generate` para gerar o Prisma Client e `npm run typecheck` para validar
o código. Consulte `INSTALACAO.md` para configuração local e cuidados com
dados legados.
