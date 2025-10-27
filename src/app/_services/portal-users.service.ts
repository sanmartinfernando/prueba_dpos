import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RestRoutes } from '../_rest/rest-routes.config';
import { PortalUserToken } from '../_models/portal-user-token.model';
import { User } from '../_models/user.model';
import { PwdProperties } from '../_models/pwd-properties.model';
import { PwdReset } from '../_models/pwd-reset.model';

const TOKEN_KEY = 'dmf-token';

/**
 * @class PortalUsersService
 * @description
 * Servicio para gestionar la autenticación y administración de usuarios del portal Web.
 * Permite obtener tokens, resetear contraseñas, consultar políticas y recuperar accesos.
 */
@Injectable({ providedIn: 'root' })
export class PortalUsersService {
  
  private http = inject(HttpClient);

  public httpOptions = {
    headers: new HttpHeaders({ 'Content-type': 'application/json' })
  };

  /**
   * Obtiene el token de autenticación para un usuario.
   * 
   * @param user Datos del usuario (usuario y contraseña).
   * @returns Observable con el token de usuario.
   */
  public getToken(user: User): Observable<PortalUserToken> {
    if (user) {
      const loginRequest = { userName: user.user, password: user.pwd };
      const url = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS_LOGIN}`;
      return this.http.post<PortalUserToken>(url, loginRequest);
    }
    return throwError(() => new Error('Datos de usuario no proporcionados.'));  
  }

  /**
   * Solicita el reseteo de contraseña para un usuario.
   * 
   * @param parameters Parámetros requeridos para el reseteo.
   * @returns Observable con la respuesta del reseteo.
   */
  public resetPwd(parameters: any): Observable<PwdReset> {
    const url = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS_PWD_RESET}`;
    return this.http.post<PwdReset>(url, parameters, this.httpOptions);
  }

  /**
   * Consulta las propiedades y restricciones de contraseñas del sistema.
   * 
   * @returns Observable con las propiedades de la contraseña.
   */
  public checkPwdProperties(): Observable<PwdProperties> {
    const url = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS_PWD_PROPERTIES}`;
    return this.http.get<PwdProperties>(url, this.httpOptions);
  }

  /**
   * Inicia el proceso de recuperación de contraseña para un usuario.
   * 
   * @param user Datos del usuario para recuperación.
   * @returns Token de usuario almacenado localmente.
   */
  public async recoverPwd(user: any): Promise<string> {
    const url = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS_PWD_RECOVER}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify(user)
    });
    return this.getTokenKey();
  }

  /**
   * Obtiene el token almacenado en el almacenamiento local del navegador.
   * 
   * @returns Token en formato string.
   */
  public getTokenKey(): string {
    return window.localStorage.getItem(TOKEN_KEY) || '';
  }
}
