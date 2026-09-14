import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    deleteClinic,
    deleteClinicParamsSchema,
    deleteClinicResponseSchema,
} from "../functions/Clinic_Delete.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const deleteClinicRoute: FastifyPluginCallbackZod = async (app) => {
    app.delete(
        "/clinics/:id",
        {
            preHandler: [auth],
            schema: {
                tags: ["Clinics"],
                description: "Delete clinic for the authenticated user.",
                params: deleteClinicParamsSchema,
                response: {
                    200: deleteClinicResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.sub;
            
            const result = await deleteClinic({ id }, userId);

            return reply.status(200).send(ok(result, "Clínica deletada com sucesso!"));
        },
    );
};