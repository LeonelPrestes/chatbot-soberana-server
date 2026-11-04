FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm run build \
  && mkdir -p dist/uploads

EXPOSE 8081

CMD ["sh", "-c", "npm run db:deploy && npm run db:seed && npm start"]
