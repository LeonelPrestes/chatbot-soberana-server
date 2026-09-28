import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import {
    getClinicPricingDefaults,
    clinicPricingDefaultsParamsSchema,
    getClinicPricingDefaultsResponseSchema,
} from "../functions/ClinicPricing_Default.js";
import { ok } from "../lib/api-response.js";
import { auth } from "../middleware/auth.js";

export const clinicPricingDefaultsRoute: FastifyPluginCallbackZod = async (app) => {
    app.get(
        "/clinics/:clinicId/pricing-defaults",
        {
            preHandler: [auth],
            schema: {
                tags: ["Clinics"],
                description: "Derive default pricing parameters (fixed cost, commission, materials) from a clinic's commercial settings.",
                params: clinicPricingDefaultsParamsSchema,
                response: { 200: getClinicPricingDefaultsResponseSchema },
            },
        },
        async (request, reply) => {
            const userId = request.user.sub;
            const result = await getClinicPricingDefaults(request.params, userId);
            return reply.status(200).send(ok(result, "Defaults derivados com sucesso!"));                
        },
    );
};