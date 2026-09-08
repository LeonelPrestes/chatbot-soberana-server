import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ResourceNotFoundError } from "../errors/index.js";
import { createClinicSchema, clinicSchema } from "./Clinic_Create.js";

export const updateClinicParamsSchema = z.object({
    id: z.uuid({ error: "Id inválido! "}),
});
export const updateClinicBodySchema = createClinicSchema.partial().strict();

export const updateClinicResponseSchema = z.object({
    status: z.boolean(),
    data: clinicSchema,
    message: z.string(),
    timestamp: z.string(),
});

type UpdateClinicParams = z.infer<typeof updateClinicParamsSchema>;
type UpdateClinicBody = z.infer<typeof updateClinicBodySchema>;
type UpdateResponse = z.infer<typeof clinicSchema>;

export async function updateClinic( { id }: UpdateClinicParams, data: UpdateClinicBody, userId: string): Promise<UpdateResponse> {
    const clinic = await prisma.clinic.findFirst({
        where: {
            id,
            userId,
            deletedAt: null,
        },
    });

    if(!clinic)
        throw new ResourceNotFoundError("Clínica não encontrada!");

    const update = await prisma.clinic.update({
        where: { id },
        data,
    });

    return clinicSchema.parse({
        id: update.id,
        name: update.name,
        city: update.city,
        state: update.state,
        address: update.address ?? undefined,
        clinicType: update.clinicType,
        materialSupplier: update.materialSupplier,
        paymentMethod: update.paymentMethod,
        commissionPercentage: update.commissionPercentage?.toNumber() ?? undefined,
        rentAmount: update.rentAmount?.toNumber() ?? undefined,
        otherExpenses: update.otherExpenses?.toNumber() ?? undefined,
        notes: update.notes ?? undefined,
    });
};