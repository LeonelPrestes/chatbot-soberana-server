# Instalacao e inicio

## Requisitos

- Node.js instalado
- Docker instalado, para rodar o Postgres local
- pnpm via Corepack

## Instalar dependencias

```powershell
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
```

## Configurar ambiente

Crie um arquivo `.env` com base no `.env.example` e adicione tambem:

```env
JWT_SECRET="uma-chave-secreta-local"
```

Para gerar uma chave aleatoria:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Gerar Prisma Client

```powershell
pnpm exec prisma generate
pnpm exec tsc --noEmit
```

## Rodar banco local

```powershell
docker compose up -d
```

O Postgres local fica disponivel em `localhost:5452`, conforme `docker-compose.yml` e `.env.example`.

## Rodar API

```powershell
pnpm dev
```

A API sobe em:

```text
http://localhost:8081
```

A documentacao fica em:

```text
http://localhost:8081/docs
```

## Últimas Atualizações

- Projeto validado com `pnpm exec tsc --noEmit` apos gerar o Prisma Client.
- Criado o model `User` em `prisma/schema.prisma`, mapeado para a tabela `users`.
- Criado o enum `UserType`, mapeado para `tipo_usuario`, com valores `estudante` e `profissional`.
- Campos do usuario seguem o PDF: cadastro inicial obrigatorio, dados progressivos opcionais e sem CRO no MVP.
- Campos do banco foram mapeados com `@map` e `@@map` para manter camelCase no TypeScript e snake_case no PostgreSQL.
- Prisma Client regenerado com `pnpm exec prisma generate`.
- Criado `prisma/instruções_schema.md` com explicacao da pasta `prisma`, `schema.prisma`, models, migrations, comandos e cuidados.
- Ainda nao foi criada migration para o model `User`; o schema foi alterado, mas a tabela ainda precisa ser aplicada no banco.

## Estado atual do projeto

O projeto ja inicia com Fastify, CORS, JWT, cookies, upload de arquivos, arquivos estaticos, Swagger/Scalar, logger com Pino, tratamento global de erros e Prisma configurado.

O `prisma/schema.prisma` ja possui a configuracao do PostgreSQL, a configuracao do Prisma Client, o enum `UserType` e o model `User`.

Ainda nao existem rotas de negocio registradas, nem migrations criadas/aplicadas. O banco local so tera a tabela `users` depois de rodar a primeira migration.

## Proximos passos

1. Criar e aplicar a primeira migration: `pnpm exec prisma migrate dev --name create_users`.
2. Confirmar a tabela `users` no banco e revisar o SQL gerado em `prisma/migrations`.
3. Criar a estrutura de rotas de autenticacao e registrar no `src/app.ts`.
4. Implementar cadastro de usuario com hash de senha e aceite de termos/politica.
5. Implementar login com JWT.
6. Definir o proximo model do MVP, provavelmente `Estabelecimento`, com relacionamento para `User`.

## Instruções de Manutenção

Sempre que alguma coisa relevante for alterada no projeto:

1. Adicionar um item em `Últimas Atualizações` explicando exatamente o que mudou.
2. Atualizar `Estado atual do projeto` para refletir a situacao real do codigo.
3. Atualizar `Proximos passos` com as proximas tarefas mais importantes.
