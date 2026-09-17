import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
    ResourceNotFoundError,
    ConflictError,
} from "../errors/index.js";

export const deleteProcedureParamsSchema = z.object({
    id: z.uuid({ error: "Id inválido! " }),
});

export const deleteProcedureResponseSchema = z.object({
    status: z.boolean(),
    data: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }),
    message: z.string(),
    timestamp: z.string(),
});

type DeleteProcedureParams = z.infer<typeof deleteProcedureParamsSchema>;
type DeleteResponse = z.infer<typeof deleteProcedureResponseSchema.shape.data>;

export async function deleteProcedure({ id }: DeleteProcedureParams, userId: string,
): Promise<DeleteResponse> {

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

    const pricing = await prisma.pricing.findFirst({
        where: {
            clinicId: procedure.clinicId,
            deletedAt: null,
            procedureType: procedure.name,
        },
    });

    if (pricing)
        throw new ConflictError(
            "Não é possível excluir um procedimento vinculado a uma precificação!",
        );

    const deleted = await prisma.procedure.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });

    return deleteProcedureResponseSchema.shape.data.parse({
        id: deleted.id,
        name: deleted.name,
    });
};