import { loggerOptions } from './lib/logger.js'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fastifySwagger from '@fastify/swagger'
import fastifyApiReference from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env/env.js'
import { errorHandler } from './errors/error-handler.js'
import { ok } from './lib/api-response.js'
import { prismaPlugin } from './plugins/prisma.js'
import { apiModules } from './modules/index.js'

import path from 'node:path'

const __dirname = import.meta.dirname

export const app = fastify({
  logger: loggerOptions,
}).withTypeProvider<ZodTypeProvider>()

app.register(prismaPlugin)
app.get('/health', async () => ok({ uptime: process.uptime() }, 'API operacional'))

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
app.register(fastifyCors, {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
})

app.register(fastifyMultipart, {
  attachFieldsToBody: true,
  prefix: 'files',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

const uploadsPath = path.join(__dirname, '..', 'uploads')

app.register(fastifyStatic, {
  root: uploadsPath,
  prefix: '/files/',
  decorateReply: true,
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: false,
  },
  sign: {
    expiresIn: env.JWT_EXPIRES,
  },
})

app.register(fastifyCookie)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Soberana API',
      description: 'API documentation for Soberana Dental Marketplace',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifyApiReference, {
  routePrefix: '/docs',
  openApiDocumentEndpoints: { json: '/json' },
  configuration: {
    theme: 'mars',
    hideClientButton: true,
  },
})

app.register(apiModules, { prefix: '/api' })

app.get('/api/docs/json', async () => app.swagger())

errorHandler(app)
