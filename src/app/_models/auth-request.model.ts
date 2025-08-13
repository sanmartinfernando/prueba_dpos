/**
 * AuthRequest representa los datos necesarios para autenticar una solicitud.
 * Contiene la clave del cliente y la clave secreta para autenticación.
 */
export class AuthRequest {

  public clientKey: string;
  public secretKey: string;
}
