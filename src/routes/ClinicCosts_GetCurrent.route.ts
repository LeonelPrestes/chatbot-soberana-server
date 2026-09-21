import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    getCurrentClinicCosts,
    getCurrentClinicCostsResponseSchema,
} from "../functions/ClinicCosts_GetCurrent.js";
import { clinicCostsParamsSchema } from "../functions/ClinicCosts_Create.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const getCurrentClinicCostsRoute: FastifyPluginCallbackZod = async (app) => {
    app.get(
        "clinics/:clinicId/costs/current",
        {
            preHandler: [auth],
            schema: {
                tags: ["Clinic Costs"],
                description: "Get the current (vigente) cost period for a clinic.",
                params: clinicCostsParamsSchema,
                response: { 
                    200: getCurrentClinicCostsResponseSchema},
            },
        },
        async (request, reply) => {
            const userId = request.user.sub;
            const result = await getCurrentClinicCosts(request.params, userId);
            return reply.status(200).send(ok(result, "Custo vigente encontrado!"));
        },
    );
};