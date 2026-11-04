# Instalação da API Soberana

## Requisitos

- Node.js 24 e npm
- Docker com Compose para executar PostgreSQL localmente

## Configuração local

```bash
cp .env.example .env
npm ci
npm run db:generate
```

Preencha `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES` e `IA_API_KEY` no `.env`. O servidor valida essas variáveis ao iniciar e mostra os nomes das que estiverem ausentes. A chave de IA pode ser um valor de desenvolvimento enquanto a integração com IA não existir; nunca use uma chave real no arquivo versionado.

Para subir apenas o banco e executar a API no host:

```bash
docker compose up -d --wait postgres
npm run db:deploy
npm run db:seed
npm run dev
```

Para subir API e banco juntos:

```bash
docker compose up --build --wait
```

O contêiner da API aplica migrations e executa o seed idempotente antes de iniciar. A API atende em `http://localhost:8081`, a rota de saúde em `/health` e a documentação em `/docs`. O volume `uploads` preserva os arquivos enviados entre reinicializações. Para criar um usuário local no seed, configure `DEV_USER_EMAIL` e `DEV_USER_PASSWORD` juntos; sem ambos, o seed cria somente especialidades e procedimentos de exemplo.

## Verificação

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Os testes incluem aplicação das migrations em PostgreSQL embarcado, preservação de dados legados, restrições monetárias, vigência única de custos, auditoria, helpers de resposta, filtro de exclusão lógica e `/health`. O build gera `dist/src/server.js`.

## Dados e migrations

A migration M0 migra nomes livres de procedimentos de precificações antigas para chaves estrangeiras, preserva valores dos itens e payloads de mensagens, e converte custos antigos fechados por `deleted_at` em períodos históricos. Ela interrompe com erro claro se houver conversas antigas sem precificação vinculada; resolva esses vínculos antes de aplicá-la. CPF repetido também impede a criação do índice único. Faça backup antes de aplicar em um banco com dados reais.

Novos procedimentos padrão são registros sem usuário e sem clínica. Os nomes de especialidades e procedimentos criados pelo seed são exemplos iniciais e podem ser revistos pelo produto.

A auditoria é feita por gatilhos do banco para alterações em precificações e itens. Dentro de uma transação, futuras rotas podem informar autor e origem com:

```sql
SET LOCAL app.actor_id = 'uuid-do-usuario';
SET LOCAL app.change_source = 'manual'; -- ou 'ia'
```

Sem esses valores, o gatilho usa o proprietário da precificação e origem manual. Leituras comuns pelo cliente Prisma filtram `deletedAt = null` por padrão; para consultar excluídos, use um filtro `deletedAt` explícito.
