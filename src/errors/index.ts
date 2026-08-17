import { AppError } from './app-error.js'

export { AppError } from './app-error.js'

//Aqui onde voces irao criar os erros personalizados, cada um com seu status code
//So reptir a mesma estrutura
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403)
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 422)
  }
}
