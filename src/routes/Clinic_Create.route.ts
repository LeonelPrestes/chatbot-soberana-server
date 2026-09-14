import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    createClinic,
    createClinicSchema,
    createClinicResponseSchema,
} from "../functions/Clinic_Create.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const createClinicRoute: FastifyPluginCallbackZod = async (app) => {
    app.post(
        "/clinics",
        {
            preHandler: [auth],
            schema: {
                tags: ["Clinics"],
                description: "Create a new clinic for the authenticated user.",
                body: createClinicSchema,
                response: {
                    201: createClinicResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const data = request.body;
            const userId = request.user.sub;

            const result = await createClinic(data, userId);

            return reply.status(201).send(ok(result, "Clinica cadastrada com sucesso! "));
        },
    )
};