import type { FastifyPluginAsync } from 'fastify'
import { authRoutes } from '../routes/Auth.route.js'
import { createClinicRoute } from '../routes/Clinic_Create.route.js'
import { getAllClinicsRoute } from '../routes/Clinic_Get_All.route.js'
import { getClinicDetailsRoute } from '../routes/Clinic_Get_Details.route.js'
import { updateClinicRoute } from '../routes/Clinic_Update.route.js'
import { deleteClinicRoute } from '../routes/Clinic_Delete.route.js'
import { createClinicCostsRoute } from '../routes/ClinicCosts_Create.route.js'
import { getCurrentClinicCostsRoute } from '../routes/ClinicCosts_GetCurrent.route.js'
import { getClinicCostsHistoryRoute } from '../routes/ClinicCosts_GetHistory.route.js'
import { clinicPricingDefaultsRoute } from '../routes/ClinicPricing_Defaults.route.js'
import { createProcedureRoute } from '../routes/Procedure_Create.route.js'
import { getAllProceduresRoute } from '../routes/Procedure_Get_All.route.js'
import { getProcedureDetailsRoute } from '../routes/Procedure_Get_Details.route.js'
import { updateProcedureRoute } from '../routes/Procedure_Update.route.js'
import { deleteProcedureRoute } from '../routes/Procedure_Delete.route.js'

export const apiModules: FastifyPluginAsync = async (app) => {
  app.register(authRoutes)

  app.register(createClinicRoute)
  app.register(getAllClinicsRoute)
  app.register(getClinicDetailsRoute)
  app.register(updateClinicRoute)
  app.register(deleteClinicRoute)
  app.register(createClinicCostsRoute)
  app.register(getCurrentClinicCostsRoute)
  app.register(getClinicCostsHistoryRoute)
  app.register(clinicPricingDefaultsRoute)

  app.register(createProcedureRoute)
  app.register(getAllProceduresRoute)
  app.register(getProcedureDetailsRoute)
  app.register(updateProcedureRoute)
  app.register(deleteProcedureRoute)
}
