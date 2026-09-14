import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ResourceNotFoundError } from "../errors/index.js";

import { clinicSchema } from "./Clinic_Create.js";

export const getClinicDetailsParamsSchema = z.object({
    id: z.uuid({ error: "Id inválido!" }),
});

export const getClinicDetailsResponseSchema = z.object({
    status: z.boolean(),
    data: clinicSchema,
    message: z.string(),
    timestamp: z.string(),
});

type GetClinicDetailsParams = z.infer<typeof getClinicDetailsParamsSchema>;

type GetClinicDetailsResponse = z.infer<typeof clinicSchema>;

export async function getClinicDetails({ id }:GetClinicDetailsParams, userId: string): Promise<GetClinicDetailsResponse> {
    const clinicDetails = await prisma.clinic.findUnique({
        where: {
            userId,
            id,
            deletedAt: null,
        },
    });

    if(!clinicDetails)
        throw new ResourceNotFoundError("Clínica não encontrada!");

    return clinicSchema.parse({
        id: clinicDetails.id,
        name: clinicDetails.name,
        city: clinicDetails.city,
        state: clinicDetails.state,
        address: clinicDetails.address ?? undefined,
        clinicType: clinicDetails.clinicType,
        materialSupplier: clinicDetails.materialSupplier,
        paymentMethod: clinicDetails.paymentMethod, commissionPercentage: clinicDetails.commissionPercentage?.toNumber() ?? undefined,
        rentAmount: clinicDetails.rentAmount?.toNumber() ?? undefined,
        otherExpenses: clinicDetails.otherExpenses?.toNumber() ?? undefined,
        notes: clinicDetails.notes ?? undefined,
    });
};