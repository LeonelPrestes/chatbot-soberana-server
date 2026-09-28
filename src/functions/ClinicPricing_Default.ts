import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ResourceNotFoundError } from '../errors/index.js';

export const clinicPricingDefaultsParamsSchema = z.object({
    clinicId: z.string().uuid({ error: "Id de clínica inválido!" }),
});

export const clinicPricingDefaultsSchema = z.object({
    clinicId: z.string().uuid(),
    paymentMethod:z.enum(["COMMISSION", "MONTHLY_RENT", "FIXED_VALUE"]),
    fixedCost: z.number(), // aluguel + despesas
    commission: z.number(), // fração (0 a 1)
    defaultMaterialsCost: z.number().optional(), // 0 se clínica fornece os materiais
});

export const getClinicPricingDefaultsResponseSchema = z.object({
    status: z.boolean(),
    data: clinicPricingDefaultsSchema,
    message: z.string(),
    timestamp: z.string(),
});

type ClinicPricingDefaultsParams = z.infer<typeof clinicPricingDefaultsParamsSchema>;
type ClinicPricingDefaultsResponse = z.infer<typeof clinicPricingDefaultsSchema>;

export async function getClinicPricingDefaults({ clinicId }: ClinicPricingDefaultsParams, userId: string): Promise<ClinicPricingDefaultsResponse> {
    const clinic = await prisma.clinic.findFirst({
        where: {
            id: clinicId,
            userId,
            deletedAt: null
        },
    });

    if(!clinic)
        throw new ResourceNotFoundError("Clínica não encontrada!");

    const rentAmount = clinic.rentAmount?.toNumber() ?? 0;
    const otherExpenses = clinic.otherExpenses?.toNumber() ?? 0;
    const commissionPercentage = clinic.commissionPercentage?.toNumber() ?? 0;

    // A forma de remuneração define a lógica do cálculo
    let fixedCost: number;
    let commission: number;

    switch(clinic.paymentMethod) {
        case "MONTHLY_RENT":
            fixedCost = rentAmount + otherExpenses;
            commission = 0;
            break;
        case "COMMISSION":
            fixedCost = otherExpenses;
            commission = commissionPercentage;
            break;
        case "FIXED_VALUE":
            fixedCost = otherExpenses;
            commission = 0;
            break;
    }

    // Se a clínica é uqem fornece os materiais, o dentista não paga por eles
    const defaultMaterialsCost = clinic.materialSupplier === "CLINIC" ? 0 : undefined;

    return clinicPricingDefaultsSchema.parse({
        clinicId: clinic.id,
        paymentMethod: clinic.paymentMethod,
        fixedCost,
        commission,
        defaultMaterialsCost,
    });
};