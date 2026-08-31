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

## Estado atual do projeto

O projeto ja inicia com Fastify, CORS, JWT, cookies, upload de arquivos, arquivos estaticos, Swagger/Scalar, logger com Pino, tratamento global de erros e Prisma configurado.

Atualmente ainda nao existem rotas de negocio registradas, nem models no `prisma/schema.prisma`, nem migrations.

## Proximos passos

1. Definir os models principais no `prisma/schema.prisma`.
2. Criar e aplicar a primeira migration do banco.
3. Criar estrutura de rotas e registrar no `src/app.ts`.
4. Implementar autenticacao inicial com JWT.
5. Criar os primeiros endpoints de negocio.
6. Adicionar scripts de validacao e build.
