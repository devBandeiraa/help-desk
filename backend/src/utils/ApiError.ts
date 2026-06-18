/** Erro de aplicação com status HTTP e código semântico. */
export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly details?: unknown

  constructor(statusCode: number, message: string, code = 'ERROR', details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, 'BAD_REQUEST', details)
  }
  static unauthorized(message = 'Não autenticado') {
    return new ApiError(401, message, 'UNAUTHORIZED')
  }
  static forbidden(message = 'Sem permissão') {
    return new ApiError(403, message, 'FORBIDDEN')
  }
  static notFound(message = 'Recurso não encontrado') {
    return new ApiError(404, message, 'NOT_FOUND')
  }
  static conflict(message: string) {
    return new ApiError(409, message, 'CONFLICT')
  }
}
