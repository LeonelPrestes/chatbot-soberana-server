import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";

import {
    createProcedure,
    createProcedureSchema,
    createProcedureResponseSchema,
} from "../functions/Procedure_Create.js";

import { ok } from "../lib/api-response.js";

import { auth } from "../middleware/auth.js";

export const createProcedureRoute: FastifyPluginCallbackZod = async (app) => {

    app.post(
        "/procedures",
        {
            preHandler: [auth],
            schema: {
                tags: ["Procedures"],
                description: "Create a new procedure for the authenticated user.",
                body: createProcedureSchema,
                response: {
                    201: createProcedureResponseSchema,
                },
            },
        },

        async (request, reply) => {
            const data = request.body;
            const userId = request.user.sub;

            const result = await createProcedure(data, userId);

            return reply.status(201).send(ok(result, "Procedimento cadastrado com sucesso!"));
        },
    )
};