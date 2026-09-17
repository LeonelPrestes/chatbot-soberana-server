import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ResourceNotFoundError } from "../errors/index.js";
import { createProcedureSchema, procedureSchema } from "./Procedure_Create.js";

export const updateProcedureParamsSchema = z.object({
    id: z.uuid({ error: "Id inválido! " }),
});

export const updateProcedureBodySchema = createProcedureSchema.partial().strict();

export const updateProcedureResponseSchema = z.object({
    status: z.boolean(),
    data: procedureSchema,
    message: z.string(),
    timestamp: z.string(),
});

type UpdateProcedureParams = z.infer<typeof updateProcedureParamsSchema>;
type UpdateProcedureBody = z.infer<typeof updateProcedureBodySchema>;
type UpdateResponse = z.infer<typeof procedureSchema>;

export async function updateProcedure(
    { id }: UpdateProcedureParams,
    data: UpdateProcedureBody,
    userId: string,
): Promise<UpdateResponse> {

    const procedure = await prisma.procedure.findFirst({
        where: {
            id,
            deletedAt: null,
            clinic: {
                userId,
                deletedAt: null,
            },
        },
    });

    if (!procedure)
        throw new ResourceNotFoundError("Procedimento não encontrado!");

    const update = await prisma.procedure.update({
        where: { id },
        data,
    });

    return procedureSchema.parse({
        id: update.id,
        clinicId: update.clinicId,
        name: update.name,
        category: update.category,
        averageTime: update.averageTime ?? undefined,
        description: update.description ?? undefined,
    });
};