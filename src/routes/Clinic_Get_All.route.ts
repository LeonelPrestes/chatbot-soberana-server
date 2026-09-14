import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    getAllClinics,
    getClinicsQuerySchema,
    getClinicsResponseSchema,
} from '../functions/Clinic_Get_All.js';
import { ok } from '../lib/api-response.js';
import { auth } from "../middleware/auth.js";

export const getAllClinicsRoute: FastifyPluginCallbackZod = async (app) => {
    app.get(
        "/clinics",
        {
            preHandler: [auth],
            schema: {
                tags: ["Clinics"],
                description: "Get all clinics for the authenticated user, optionally filtered by name.",
                querystring: getClinicsQuerySchema,
                response: {
                    200: getClinicsResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const userId = request.user.sub;

            const result = await getAllClinics(userId, request.query);
            return reply.status(200).send(ok(result, "Clínicas listadas com sucesso!"));
        },
    );
};