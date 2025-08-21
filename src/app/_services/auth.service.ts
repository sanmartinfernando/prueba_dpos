import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { User } from '../_models/user.model';
import { RestRoutes } from '../_rest/rest-routes.config';
import { LoginRequest } from '../_models/login-request.model';
import { StringConstants } from '../_rest/string-constants';
import { AuthRequest } from '../_models/auth-request.model';
import { TokenStorageService } from './token-storage.service';

/**
 * @class AuthService
 * @description
 * Servicio encargado de gestionar la autenticación de usuarios y el manejo de tokens.
 * Proporciona métodos para:
 * - Iniciar sesión (obtener tokens).
 * - Autorizar cliente (token secundario).
 * - Obtener información de usuario autenticado.
 * - Gestionar sesión y almacenamiento de credenciales.
 * Se apoya en `TokenStorageService` para persistir tokens en almacenamiento local.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);

  // Observable que emite eventos de login/logout con el usuario autenticado
  public configObservable = new Subject<User>();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  /**
   * Manejo genérico de errores en peticiones `fetch`.
   * Solo acepta códigos 200 (OK) o 409 (CONFLICT).
   *
   * @param response Respuesta HTTP
   * @returns Respuesta validada
   * @throws Error si el estado HTTP no es 200 o 409
   */
  private static handleErrors(response: Response) {
    if (!(response.status === 200 || response.status === 409)) {
      throw Error(response.statusText);
    }
    return response;
  }

  /**
   * Realiza el login completo de usuario.
   * - Autentica contra PortalUsers.
   * - Autoriza cliente para obtener un segundo token.
   *
   * @param UserName Nombre de usuario
   * @param Password Contraseña del usuario
   * @returns Token principal del usuario
   */
  public async login(UserName: string, Password: string): Promise<string> {
    await this.loginPortalUsers(UserName, Password);
    await this.authorizeClient();
    return this.tokenStorage.getToken();
  }

  /**
   * Obtiene la información del usuario autenticado desde la API.
   *
   * @returns Información de usuario (`User`)
   */
  public async getUserInfo(): Promise<User> {
    const urlUser = `${environment.urlAuth}${RestRoutes.USER}`;
    return firstValueFrom(this.http.get<User>(urlUser, this.httpOptions));
  }

  /**
   * Emite un evento de login con la información de usuario.
   *
   * @param user Usuario autenticado
   */
  public loginEvent(user: User) {
    this.configObservable.next(user);
  }

  /**
   * Cierra sesión del usuario:
   * - Limpia localStorage y sessionStorage.
   * - Notifica mediante `configObservable`.
   */
  public logOut() {
    window.localStorage.clear();
    sessionStorage.clear();
    this.configObservable.next(null);
  }

  /**
   * Guarda el nombre de usuario en localStorage.
   *
   * @param username Nombre de usuario a guardar
   */
  public saveUserName(username: string): void {
    window.localStorage.setItem(StringConstants.USERNAME_KEY, username);
  }

  /**
   * Realiza login contra el servicio de PortalUsers.
   * Obtiene el token principal y lo guarda en el almacenamiento.
   *
   * @param userName Nombre de usuario
   * @param password Contraseña
   */
  private async loginPortalUsers(userName: string, password: string): Promise<void> {
    const urlLogin = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS}/login`;
    const loginRequest = new LoginRequest();
    loginRequest.userName = userName;
    loginRequest.password = password;

    const result = await fetch(urlLogin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(loginRequest),
    })
      .then(AuthService.handleErrors)
      .then((res) => res.json());

    // Guardar token principal a través del TokenStorageService
    this.tokenStorage.saveToken(result.token);
    this.saveUserName(userName);

    // Emite evento de login
    const userInfo = new User();
    userInfo.user = userName;
    userInfo.pwd = password;
    this.loginEvent(userInfo);
  }

  /**
   * Autoriza cliente y guarda un segundo token (`token2`).
   */
  private async authorizeClient(): Promise<void> {
    const urlLogin2 = `${environment.urlAuth}${RestRoutes.AUTH}/authorize`;
    const loginRequest2 = new AuthRequest();
    loginRequest2.clientKey = 'F0F0427E-FDDF-4A0F-910B-7FE1075BE366';
    loginRequest2.secretKey = 'j5$R8N3DB1my';

    const result = await fetch(urlLogin2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(loginRequest2),
    })
      .then(AuthService.handleErrors)
      .then((res) => res.json());

    window.localStorage.setItem(StringConstants.TOKEN_KEY2, result.token);
  }

  /**
   * Obtiene el token principal desde el almacenamiento.
   * 
   * @returns Token principal
   */
  public getToken(): string {
    return this.tokenStorage.getToken();
  }

  /**
   * Obtiene el token secundario (`token2`) desde el almacenamiento.
   * 
   * @returns Token secundario
   */
  public getToken2(): string {
    return this.tokenStorage.getToken2();
  }

  /**
   * Obtiene el token de PortalUsers desde el almacenamiento.
   * 
   * @returns Token de PortalUsers
   */
  public getPortalUsersToken(): string {
    return this.tokenStorage.getPortalUsersToken();
  }

  /**
   * Establece el token de PortalUsers en el almacenamiento.
   * 
   * @param token Token de PortalUsers
   */
  public setPortalUsersToken(token: string): void {
    this.tokenStorage.setPortalUsersToken(token);
  }

  /**
   * Elimina todos los tokens del almacenamiento.
   */
  public clearToken(): void {
    this.tokenStorage.clearToken();
  }
}
