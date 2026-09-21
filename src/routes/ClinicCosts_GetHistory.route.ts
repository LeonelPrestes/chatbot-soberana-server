import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    getClinicCostsHistory,
    getClinicCostsHistoryResponseSchema,
} from "../functions/ClinicCosts_GetHistory.js";
import { clinicCostsParamsSchema } from "../functions/ClinicCosts_Create.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const getClinicCostsHistoryRoute: FastifyPluginCallbackZod = async (app) => {
    app.get(
        "clinics/:clinicId/costs/history",
        {
            preHandler: [auth],
            schema: {
                tags: ["Clinic Costs"],
                description: "Get the full cost history of a clinic.",
                params: clinicCostsParamsSchema,
                response: { 
                    200: getClinicCostsHistoryResponseSchema },
            },
        },
        async (request, reply) => {
            const userId = request.user.sub;
            const result = await getClinicCostsHistory(request.params, userId);
            return reply.status(200).send(ok(result, "Histórico de custos listado com sucesso!"));
        },
    );
};