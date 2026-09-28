import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    deleteProcedure,
    deleteProcedureParamsSchema,
    deleteProcedureResponseSchema,
} from "../functions/Procedure_Delete.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const deleteProcedureRoute: FastifyPluginCallbackZod = async (app) => {
    app.delete(
        "/procedures/:id",
        {
            preHandler: [auth],
            schema: {
                tags: ["Procedures"],
                description: "Delete procedure for the authenticated user.",
                params: deleteProcedureParamsSchema,
                response: {
                    200: deleteProcedureResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.sub;

            const result = await deleteProcedure({ id }, userId);

            return reply
                .status(200)
                .send(ok(result, "Procedimento deletado com sucesso!"));
        },
    );
};