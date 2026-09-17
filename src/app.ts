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

import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const app = fastify({
  logger: loggerOptions,
}).withTypeProvider<ZodTypeProvider>()

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
import { deleteProcedureRoute } from './routes/Procedute_Delete.route.js';


app.register(createClinicRoute);
app.register(getAllClinicsRoute);
app.register(getClinicDetailsRoute);
app.register(updateClinicRoute);
app.register(deleteClinicRoute);
// Procedimentos Routes
app.register(createProcedureRoute);
app.register(getAllProceduresRoute);
app.register(getProcedureDetailsRoute)
app.register(updateProcedureRoute)
app.register(deleteProcedureRoute)

errorHandler(app)
