import { z } from "zod";
import { prisma } from "../lib/prisma.js"
import { procedureSchema } from "./Procedure_Create.js";

export const getProceduresQuerySchema = z.object({
    search: z.string().min(1, { error: "Informe um termo de busca" }).optional(), // search será opcional
});

export const getProceduresResponseSchema = z.object({
    status: z.boolean(),
    data: z.array(
        z.object({
            id: z.string(),
            clinicId: z.string().nullable(),
            name: z.string(),
            category: z.string().nullable(),
            averageTime: z.number().int().positive().optional(),
            description: z.string().optional(),
        }),
    ),
    message: z.string(),
    timestamp: z.string(),
});

type GetProceduresQuery = z.infer<typeof getProceduresQuerySchema>;
type ProcedureResponse = z.infer<typeof procedureSchema>;

export async function getAllProcedures(userId: string, { search }: GetProceduresQuery,
): Promise<ProcedureResponse[]> {
    const procedures = await prisma.procedure.findMany({
        where: {
            deletedAt: null,
            active: true,
            OR: [
                { userId: null, clinicId: null },
                { userId, clinic: { deletedAt: null } },
            ],
            ...(search && {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            }),
        },
        orderBy: {
            name: "asc",
        },
    });

    return procedures.map((procedure) => ({
        id: procedure.id,
        clinicId: procedure.clinicId,
        name: procedure.name,
        category: procedure.category,
        averageTime: procedure.averageTime ?? undefined,
        description: procedure.description ?? undefined,
    }));
}
