import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    createClinicCosts,
    clinicCostsParamsSchema,
    createClinicCostsSchema,
    createClinicCostsResponseSchema,
} from "../functions/ClinicCosts_Create.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const createClinicCostsRoute: FastifyPluginCallbackZod = async (app) => {
    app.post(
        "/clinics/:clinicId/costs",
        {
            preHandler: [auth],
            schema: {
                tags: ["Clinic Costs"],
                description: "Create a new cost period for a clinic, closing the previous one.",
                params: clinicCostsParamsSchema,
                body: createClinicCostsSchema,
                response: { 
                    201: createClinicCostsResponseSchema },
            },
        },
        async (request, reply) => {
            const userId = request.user.sub;
            const result = await createClinicCosts(request.params, request.body, userId);
            return reply.status(201).send(ok(result, "Período de custo criado com sucesso!"));
        },
    );
};