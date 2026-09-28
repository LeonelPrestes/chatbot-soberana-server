import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    getProcedureDetails,
    getProcedureDetailsParamsSchema,
    getProcedureDetailsResponseSchema,
} from "../functions/Procedure_Get_Details.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const getProcedureDetailsRoute: FastifyPluginCallbackZod = async (app) => {
    app.get(
        "/procedures/:id",
        {
            preHandler: [auth],
            schema: {
                tags: ["Procedures"],
                description: "Get procedure details for the authenticated user.",
                params: getProcedureDetailsParamsSchema,
                response: {
                    200: getProcedureDetailsResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.sub;

            const result = await getProcedureDetails({ id }, userId);

            return reply
                .status(200)
                .send(ok(result, "Procedimento encontrado!"));
        },
    );
};