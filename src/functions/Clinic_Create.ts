import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ConflictError } from "../errors/index.js";


// Schema de request que serão recebidos do front
export const createClinicSchema = z.object({
    name: z.string({ error: "O nome é obrigatório!! " }).min(2),
    city: z.string({ error: "É obrigatório informar a cidade! " }).min(2),
    state: z.string({ error: "É obrigatório informar o estado! " }).min(2),
    address: z.string({ error: "Endereço inválido! " }).nullable().optional(),
    clinicType: z.enum(["OWN", "OUTSOURCED"]),
    materialSupplier: z.enum(["DENTIST", "CLINIC"]),
    paymentMethod: z.enum(["COMMISSION", "MONTHLY_RENT", "FIXED_VALUE"]),
    commissionPercentage: z.number({ error: "O percentual deve ser um número entre 0.00(0%) e 1.00(100%)! " }).min(0, { error: "O percentual não pode ser negativo " }).max(1, { error: "O percentual não pode ser maior que 1(100%) " }).optional(),
    rentAmount: z.number({ error: "O valor do aluguel deve ser um número positivo! " }).min(0).optional(),
    otherExpenses: z.number({ error: "As despesas devem ser registradas como números acima de 0! " }).min(0).optional(),
    notes: z.string().optional(),
});

// Schema da resposta da API
export const clinicSchema = createClinicSchema.extend({
    id: z.string().uuid(),
});

export const createClinicResponseSchema = z.object({
    status: z.boolean(),
    data: clinicSchema,
    message: z.string(),
    timestamp: z.string(),
});

// Transformando o schema de createClinic em um typeScript para desestruturar o objeto
type createClinicRequest = z.infer<typeof createClinicSchema>;
type clinicResponse = z.infer<typeof clinicSchema>;

export async function createClinic(data: createClinicRequest, userId:string,
): Promise<clinicResponse> {
    const clinic = await prisma.clinic.findFirst({
        where: {
            name: data.name,
            city: data.city,
            userId,
            deletedAt: null,
        },
    });
    if (clinic)
        throw new ConflictError("Clinica já cadastrada no sistema");
    const { name, city, state, address, clinicType, materialSupplier, paymentMethod, commissionPercentage, rentAmount, otherExpenses, notes } = data;

    const criarClinica = await prisma.clinic.create({
        data: {
            userId,
            name,
            city,
            state, 
            address, 
            clinicType, 
            materialSupplier, 
            paymentMethod, 
            commissionPercentage, 
            rentAmount, 
            otherExpenses, 
            notes,
        },
    });

    return clinicSchema.parse({
        id: criarClinica.id,
        name: criarClinica.name,
        city: criarClinica.city,
        state: criarClinica.state,
        address: criarClinica.address ?? undefined,
        clinicType: criarClinica.clinicType,
        materialSupplier: criarClinica.materialSupplier,
        paymentMethod: criarClinica.paymentMethod,
        commissionPercentage: criarClinica.commissionPercentage?.toNumber() ?? undefined,
        rentAmount: criarClinica.rentAmount?.toNumber() ?? undefined,
        otherExpenses: criarClinica.otherExpenses?.toNumber() ?? undefined,
        notes: criarClinica.notes ?? undefined,
    });
};