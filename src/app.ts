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

import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const app = fastify({}).withTypeProvider<ZodTypeProvider>()

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
    expiresIn: '7d',
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
  configuration: {
    theme: 'mars',
    hideClientButton: true,
  },
})

errorHandler(app)

//Routes
import { createUserExampleRoute } from './routes/EXAMPLE_Create.route.js'
import { deleteUserExampleRoute } from './routes/EXAMPLE_Delete.route.js'
import { getAllUsersRoute } from './routes/EXAMPLE_Get_All.route.js'
import { getUserDetailsRoute } from './routes/EXAMPLE_Get_Details.route.js'
import { updateUserRoute } from './routes/EXAMPLE_Update.route.js'

app.register(createUserExampleRoute)
app.register(deleteUserExampleRoute)
app.register(getAllUsersRoute)
app.register(getUserDetailsRoute)
app.register(updateUserRoute)
