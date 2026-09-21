import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { 
    getClinicDetails,
    getClinicDetailsParamsSchema,
    getClinicDetailsResponseSchema,
} from "../functions/Clinic_Get_Details.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js"

export const getClinicDetailsRoute: FastifyPluginCallbackZod = async (app) => {
    app.get(
        "/clinics/:id",
        {
            preHandler: [auth],
            schema: {
                tags: ["Clinics"],
                description: "Get clinic details for the authenticated user.",
                params: getClinicDetailsParamsSchema,
                response: {
                    200: getClinicDetailsResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.sub;

            const result = await getClinicDetails({ id }, userId);
            return reply.status(200).send(ok(result, "Clínica encontrada!"));
        },
    );
};