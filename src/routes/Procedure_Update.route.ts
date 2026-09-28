import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";

import {
    updateProcedure,
    updateProcedureResponseSchema,
    updateProcedureParamsSchema,
    updateProcedureBodySchema,
} from "../functions/Procedure_Update.js";

import { ok } from "../lib/api-response.js";

import { auth } from "../middleware/auth.js";

export const updateProcedureRoute: FastifyPluginCallbackZod = async (app) => {
    app.patch(
        "/procedures/:id",
        {
            preHandler: [auth],
            schema: {
                tags: ["Procedures"],
                description: "Update procedure for the authenticated user.",
                params: updateProcedureParamsSchema,
                body: updateProcedureBodySchema,
                response: {
                    200: updateProcedureResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.sub;

            const result = await updateProcedure(
                { id },
                request.body,
                userId,
            );

            return reply
                .status(200)
                .send(ok(result, "Procedimento atualizado com sucesso!"));
        },
    );
};