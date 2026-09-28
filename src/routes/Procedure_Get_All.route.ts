import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    getAllProcedures,
    getProceduresQuerySchema,
    getProceduresResponseSchema,
} from '../functions/Procedure_Get_All.js';
import { ok } from '../lib/api-response.js';
import { auth } from "../middleware/auth.js";

export const getAllProceduresRoute: FastifyPluginCallbackZod = async (app) => {
    app.get(
        "/procedures",
        {
            preHandler: [auth],
            schema: {
                tags: ["Procedures"],
                description: "Get all procedures for the authenticated user, optionally filtered by name.",
                querystring: getProceduresQuerySchema,
                response: {
                    200: getProceduresResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const userId = request.user.sub;

            const result = await getAllProcedures(userId, request.query);
            return reply.status(200).send(ok(result, "Procedimentos listados com sucesso!"));
        },
    );
};