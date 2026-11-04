import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ResourceNotFoundError } from "../errors/index.js"; // Não usei ConflictError porque não documentado dizendo que dois procedimentos com o mesmo nome são proibidos.


// Schema de request que serão recebidos do front
export const createProcedureSchema = z.object({
    clinicId: z.string().uuid(),
    name: z.string().min(2),
    category: z.string().min(2),
    averageTime: z.number().int().positive().optional(),
    description: z.string().optional(),
});

// Schema da resposta da API
export const procedureSchema = createProcedureSchema.extend({
    id: z.string().uuid(),
    clinicId: z.string().uuid().nullable(),
    category: z.string().nullable(),
});


export const createProcedureResponseSchema = z.object({
    status: z.boolean(),
    data: procedureSchema,
    message: z.string(),
    timestamp: z.string(),
});

// Transformando o schema de createProcedure em um typeScript para desestruturar o objeto
type CreateProcedureRequest = z.infer<typeof createProcedureSchema>;
type ProcedureResponse = z.infer<typeof procedureSchema>;

export async function createProcedure(data: CreateProcedureRequest, userId: string,
): Promise<ProcedureResponse> {
    const clinic = await prisma.clinic.findFirst({
        where: {
            id: data.clinicId,
            userId,
            deletedAt: null,
        },
    });

    if (!clinic) {
        throw new ResourceNotFoundError("Clínica não encontrada!");
    }

    const createdProcedure = await prisma.procedure.create({
        data: {
            userId,
            clinicId: data.clinicId,
            name: data.name,
            category: data.category,
            averageTime: data.averageTime,
            description: data.description,
        },
    });

    return procedureSchema.parse({
        id: createdProcedure.id,
        clinicId: createdProcedure.clinicId,
        name: createdProcedure.name,
        category: createdProcedure.category,
        averageTime: createdProcedure.averageTime ?? undefined,
        description: createdProcedure.description ?? undefined, // averageTime e description são opcionais.
    });
}
