import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ResourceNotFoundError } from "../errors/index.js";
import { procedureSchema } from "./Procedure_Create.js";

export const getProcedureDetailsParamsSchema = z.object({
    id: z.uuid({ error: "Id inválido!" }),
});

export const getProcedureDetailsResponseSchema = z.object({
    status: z.boolean(),
    data: procedureSchema,
    message: z.string(),
    timestamp: z.string(),
});

type GetProcedureDetailsParams = z.infer<typeof getProcedureDetailsParamsSchema>;
type GetProcedureDetailsResponse = z.infer<typeof procedureSchema>;

export async function getProcedureDetails(
    { id }: GetProcedureDetailsParams,
    userId: string,
): Promise<GetProcedureDetailsResponse> {

    const procedureDetails = await prisma.procedure.findFirst({
        where: {
            id,
            deletedAt: null,
            active: true,
            OR: [
                { userId: null, clinicId: null },
                { userId, clinic: { deletedAt: null } },
            ],
        },
    });

    if (!procedureDetails)
        throw new ResourceNotFoundError("Procedimento não encontrado!");

    return procedureSchema.parse({
        id: procedureDetails.id,
        clinicId: procedureDetails.clinicId,
        name: procedureDetails.name,
        category: procedureDetails.category,
        averageTime: procedureDetails.averageTime ?? undefined,
        description: procedureDetails.description ?? undefined,
    });
};
