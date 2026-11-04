import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ResourceNotFoundError } from '../errors/index.js';
import { clinicCostsParamsSchema, clinicCostsSchema } from './ClinicCosts_Create.js';

export const getClinicCostsHistoryResponseSchema = z.object({
    status: z.boolean(),
    data:z.array(clinicCostsSchema),
    message: z.string(),
    timestamp: z.string(),
});

// Converte Schema em um tipo typescript
type ClinicCostsParams = z.infer<typeof clinicCostsParamsSchema>;

export async function getClinicCostsHistory({ clinicId }: ClinicCostsParams, userId: string) {
    // Verifica a existência da clínica e se pertence ao usuário autenticado
    const clinic = await prisma.clinic.findFirst({
        where: {
            id: clinicId,
            userId,
            deletedAt: null
        },
    });

    if(!clinic)
        throw new ResourceNotFoundError("Clínica não encontrada!");

    // Pega todo o histórico, períodos vigentes e fechados
    const historico = await prisma.clinicCosts.findMany({
        where: { clinicId },
        orderBy: { effectiveDate: "desc" },
    });

    return historico.map((custo) =>
        clinicCostsSchema.parse({
            id: custo.id,
            clinicId: custo.clinicId,
            sixMonthFixedCost: custo.sixMonthFixedCost.toNumber(),
            sixMonthVariableCost: custo.sixMonthVariableCost.toNumber(),
            monthlyFixedCost: custo.monthlyFixedCost.toNumber(),
            monthlyVariableCost: custo.monthlyVariableCost.toNumber(),
            effectiveHoursPerMonth: custo.effectiveHoursPerMonth.toNumber(),
            effectiveDate: custo.effectiveDate,
        }),
    );
};
