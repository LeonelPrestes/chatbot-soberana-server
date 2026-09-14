import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ResourceNotFoundError } from "../errors/index.js";

export const deleteClinicResponseSchema = z.object({
    status: z.boolean(),
    data: z.object({
        id: z.string().uuid(),
        name: z.string(),
    }),
    message: z.string(),
    timestamp: z.string(),
});

export const deleteClinicParamsSchema = z.object({
    id: z.uuid({ error: "Id inválido! "}),
});

type deleteClinic = z.infer<typeof deleteClinicParamsSchema>;
type deleteResponse = z.infer<typeof deleteClinicResponseSchema.shape.data>;

export async function deleteClinic({ id }: deleteClinic, userId: string): Promise<deleteResponse> {
    const clinic = await prisma.clinic.findFirst({
        where: {
            id,
            userId,
            deletedAt: null,
        },
    });

    if(!clinic)
        throw new ResourceNotFoundError("Clínica não encontrada! ");

    const deleted = await prisma.clinic.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });

    return deleteClinicResponseSchema.shape.data.parse ({
        id: deleted.id,
        name: deleted.name,
    });
};