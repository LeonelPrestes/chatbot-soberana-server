import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { ConflictError } from '../errors/index.js'
import { hash } from 'bcryptjs'

// Schema da request tipado com zod
// z.object = falando que irei receber um objeto
// z.string({erro: "<msg>"}) -> tipando que o dado que ira chegar e uma string e uma msg de erro caso chegue em formato errado ou fazio
// .min(n) -> determinando o tamanho minimo da string

export const createUserExampleSchema = z.object({
  fristName: z.string({ error: 'O nome é obrigatorio!!' }).min(2),
  lastName: z.string({ error: 'O sobrenome é obrigatorio!!' }).min(2),
  email: z.email({ error: 'Email invalido!' }),
  password: z.string({ error: 'Senha invalida!!' }).min(6),
})

//Tipando como sera a resposta da api , para utilizar o swagger
export const createUserResponseSchema = z.object({
  status: z.boolean(),
  data: z.object({
    name: z.string(),
    email: z.string(),
  }),
  message: z.string(),
  timestamp: z.string(),
})

//Transformando o schema de criaçao em um type para fazer a desestruturação do objeto
type createUserExampleRequest = z.infer<typeof createUserExampleSchema>
export async function createUserExample(data: createUserExampleRequest) {
  const user = await prisma.userExample.findUnique({
    where: { email: data.email },
  })

  if (user) {
    throw new ConflictError('Usuario ja cadastrado no sistema')
  }

  const { fristName, lastName, password, email } = data
  const hashPassword = await hash(password, 6)

  const createUser = await prisma.userExample.create({
    data: {
      fristName: fristName,
      lastName: lastName,
      email: email,
      password: hashPassword,
    },
  })

  return {
    name: createUser.fristName,
    email: createUser.email,
  }
}
