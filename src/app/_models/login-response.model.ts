/**
 * @class LoginResponse
 * @description
 * Representa la respuesta de un inicio de sesión exitoso, incluyendo el nombre de usuario,
 * la fecha de expiración de la sesión y el token de autenticación.
 */
export class LoginResponse {
  
  public userName: string;
  public validTo: string;
  public token: string;
}
