import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ResourceNotFoundError } from '../errors/index.js';
import { clinicCostsParamsSchema, clinicCostsSchema } from './ClinicCosts_Create.js';

export const getCurrentClinicCostsResponseSchema = z.object({
    status: z.boolean(),
    data: clinicCostsSchema,
    message: z.string(),
    timestamp: z.string(),
});

// Converte Schema em um tipo typescript
type ClinicCostsParams = z.infer<typeof clinicCostsParamsSchema>;

export async function getCurrentClinicCosts({ clinicId }: ClinicCostsParams, userId: string,) {
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

    const custoVigente = await prisma.clinicCosts.findFirst({
        where: {
            clinicId,
            deletedAt: null
        },
    });

    if(!custoVigente)
        throw new ResourceNotFoundError("Nenhum custo vigente cadastrado para esta clínica!");

    return clinicCostsSchema.parse({
        id: custoVigente.id,
        clinicId: custoVigente.clinicId,
        sixMonthFixedCost: custoVigente.sixMonthFixedCost,
        sixMonthVariableCost: custoVigente.sixMonthVariableCost,
        monthlyFixedCost: custoVigente.monthlyFixedCost,
        monthlyVariableCost: custoVigente.monthlyVariableCost,
        effectiveHoursPerMonth: custoVigente.effectiveHoursPerMonth,
        effectiveDate: custoVigente.effectiveDate,
    });
};