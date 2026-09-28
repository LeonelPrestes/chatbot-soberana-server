import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    updateClinic,
    updateClinicResponseSchema,
    updateClinicParamsSchema,
    updateClinicBodySchema,
} from "../functions/Clinic_Update.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const updateClinicRoute: FastifyPluginCallbackZod = async (app) => {
    app.patch(
        "/clinics/:id",
        {
            preHandler:[auth],
            schema: {
                tags: ["Clinics"],
                description: "Update clinic fo the authenticated user.",
                params: updateClinicParamsSchema,
                body: updateClinicBodySchema,
                response: {
                    200: updateClinicResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.sub;

            const result = await updateClinic({ id }, request.body, userId);

            return reply.status(200).send(ok(result, "Clínica atualizada com sucesso!"));
        },
    );
};