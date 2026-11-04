export interface ApiResponse<T = null> {
  status: boolean
  data: T
  message: string
  timestamp: string
}

export function ok<T>(data: T, message = 'Sucesso'): ApiResponse<T> {
  return {
    status: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
}

export function fail(
  message: string,
  data: unknown = null,
): ApiResponse<unknown> {
  return {
    status: false,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
}
