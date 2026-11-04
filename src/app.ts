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

// Clinicas Routes

import { createClinicRoute } from './routes/Clinic_Create.route.js';
import { getAllClinicsRoute } from './routes/Clinic_Get_All.route.js';
import { getClinicDetailsRoute } from './routes/Clinic_Get_Details.route.js';
import { updateClinicRoute } from './routes/Clinic_Update.route.js';
import { deleteClinicRoute } from './routes/Clinic_Delete.route.js';
// Procedimentos Routes
import { createProcedureRoute } from './routes/Procedure_Create.route.js';
import { getAllProceduresRoute } from './routes/Procedure_Get_All.route.js';
import { getProcedureDetailsRoute } from './routes/Procedure_Get_Details.route.js';
import { updateProcedureRoute } from './routes/Procedure_Update.route.js';
import { deleteProcedureRoute } from './routes/Procedure_Delete.route.js';

import { createClinicCostsRoute } from './routes/ClinicCosts_Create.route.js'
import { getCurrentClinicCostsRoute } from './routes/ClinicCosts_GetCurrent.route.js'
import { getClinicCostsHistoryRoute } from './routes/ClinicCosts_GetHistory.route.js'
import { clinicPricingDefaultsRoute } from './routes/ClinicPricing_Defaults.route.js'
import { authRoutes } from './routes/Auth.route.js'

const apiPrefix = { prefix: '/api' }

app.register(authRoutes, apiPrefix)
app.register(createClinicRoute, apiPrefix)
app.register(getAllClinicsRoute, apiPrefix)
app.register(getClinicDetailsRoute, apiPrefix)
app.register(updateClinicRoute, apiPrefix)
app.register(deleteClinicRoute, apiPrefix)
// Procedimentos Routes
app.register(createProcedureRoute, apiPrefix)
app.register(getAllProceduresRoute, apiPrefix)
app.register(getProcedureDetailsRoute, apiPrefix)
app.register(updateProcedureRoute, apiPrefix)
app.register(deleteProcedureRoute, apiPrefix)
// Custos de Clinicas Routes
app.register(createClinicCostsRoute, apiPrefix)
app.register(getCurrentClinicCostsRoute, apiPrefix)
app.register(getClinicCostsHistoryRoute, apiPrefix)
// Derivação dos defaults de precificação Route
app.register(clinicPricingDefaultsRoute, apiPrefix)

app.get('/api/docs/json', async () => app.swagger())

errorHandler(app)
