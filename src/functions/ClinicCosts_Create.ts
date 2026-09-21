import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ResourceNotFoundError } from '../errors/index.js';

export const clinicCostsParamsSchema = z.object({
    clinicId: z.string().uuid({error: "Id de clínica inválido!"}),
});

export const createClinicCostsSchema = z.object({
    sixMonthFixedCost: z.number({ error: "O custo fixo acumulado deve ser um número!" }).min(0, { error: "O custo fixo não pode ser negativo" }),
    sixMonthVariableCost: z.number({ error: "O custo variável acumulado deve ser um número! "}).min(0, { error: "O custo variável não pode ser negativo" }),
    effectiveHoursPerMonth: z.number({ error: "As horas efetivas devem ser um número!" }).min(1, { error: "As horas efetivas devem ser maiores que zero" }),
});

export const clinicCostsSchema = z.object({
    id: z.string().uuid(),
    clinicId: z.string().uuid(),
    sixMonthFixedCost: z.number(),
    sixMonthVariableCost: z.number(),
    monthlyFixedCost: z.number(),
    monthlyVariableCost: z.number(),
    effectiveHoursPerMonth: z.number(),
    effectiveDate: z.date(),
});

export const createClinicCostsResponseSchema = z.object({
    status: z.boolean(),
    data: clinicCostsSchema,
    message: z.string(),
    timestamp: z.string(),
});

// Converte Schema em um tipo typescript
type ClinicCostsParams = z.infer<typeof clinicCostsParamsSchema>;
type CreateClinicCostsRequest = z.infer<typeof createClinicCostsSchema>;
type ClinicCostsResponse = z.infer<typeof clinicCostsSchema>;

export async function createClinicCosts({ clinicId }: ClinicCostsParams, data: CreateClinicCostsRequest, userId: string,): Promise<ClinicCostsResponse> {
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

    // Normalização: valor acumulado em 6 meses -> valor mensal
    const monthlyFixedCost = data.sixMonthFixedCost / 6;
    const monthlyVariableCost = data.sixMonthVariableCost / 6;
    const effectiveDate = new Date();

    // Em uma única transação atômica, fecha o período anterior e cria o novo período vigente, evitando sobreposição
    const [, novoCusto] = await prisma.$transaction([
        prisma.clinicCosts.updateMany({
            where: {
                clinicId,
                deletedAt: null
            },
            data: {
                deletedAt: new Date()
            },
        }),
        prisma.clinicCosts.create({
            data: {
                clinicId,
                sixMonthFixedCost: data.sixMonthFixedCost,
                sixMonthVariableCost: data.sixMonthVariableCost,
                monthlyFixedCost,
                monthlyVariableCost,
                effectiveHoursPerMonth: data.effectiveHoursPerMonth,
                effectiveDate,
            },
        }),
    ]);

    return clinicCostsSchema.parse({
        id: novoCusto.id,
        clinicId: novoCusto.clinicId,
        sixMonthFixedCost: novoCusto.sixMonthFixedCost.toNumber(),
        sixMonthVariableCost: novoCusto.sixMonthVariableCost.toNumber(),
        monthlyFixedCost: novoCusto.monthlyFixedCost.toNumber(),
        monthlyVariableCost: novoCusto.monthlyVariableCost.toNumber(),
        effectiveHoursPerMonth: novoCusto.effectiveHoursPerMonth,
        effectiveDate: novoCusto.effectiveDate,
    });
};