/**
 * @class ErrorResponse
 * @description
 * Representa la respuesta de error de una operación, incluyendo el código de estado,
 * código de error, identificador del error y mensaje descriptivo.
 */
export class ErrorResponse {
  StatusCode: number;
  ErrorCode: number;
  ErrorCodeId: string;
  Message: string;
}
