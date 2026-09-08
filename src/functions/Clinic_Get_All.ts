import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const getClinicsQuerySchema = z.object({
    search: z.string().min(1, { error: "Informe um termo de busca" }),
});

export const getClinicsResponseSchema = z.object({
    status: z.boolean(),
    data: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            city: z.string(),
            state: z.string(),
        }),
    ),
    message: z.string(),
    timestamp: z.string(),
});

type GetClinicsQuery = z.infer<typeof getClinicsQuerySchema>;

export async function getAllClinics(userId: string, { search }: GetClinicsQuery) {
    const clinics = await prisma.clinic.findMany({
        where: {
            deletedAt: null,
            userId,
            ...(search && {
                name: {
                    contains: search,
                    mode: "insensitive", // aceita Maiusc. e minusc.
                },
            }),
        },
        orderBy: { name: "asc" },
    });

    return clinics.map((clinic) => ({
        id: clinic.id,
        name: clinic.name,
        city: clinic.city,
        state: clinic.state,
    }));
};