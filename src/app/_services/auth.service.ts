import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { User } from '../_models/user.model';
import { RestRoutes } from '../_rest/rest-routes.config';
import { LoginRequest } from '../_models/login-request.model';
import { StringConstants } from '../_rest/string-constants';
import { AuthRequest } from '../_models/auth-request.model';

/**
 * Servicio de autenticación y gestión de tokens para usuarios.
 * Proporciona métodos para login, validación de token y manejo de sesión.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  public configObservable = new Subject<User>();
  private portalUsersToken: string;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  /**
   * Maneja errores de respuesta HTTP.
   * @param response Respuesta HTTP a evaluar.
   * @returns La misma respuesta si es válida.
   * @throws Error si el status no es 200 o 409.
   */
  private static handleErrors(response: Response) {
    if (!(response.status === 200 || response.status === 409)) {
      throw Error(response.statusText);
    }
    return response;
  }

  /**
   * Realiza el login completo del usuario y obtiene los tokens.
   * @param UserName Nombre de usuario.
   * @param Password Contraseña del usuario.
   * @returns Promise con el token principal.
   */
  public async login(UserName: string, Password: string): Promise<string> {
    await this.loginPortalUsers(UserName, Password);
    await this.authorizeClient();
    return this.getToken();
  }

  /**
   * Obtiene la información del usuario autenticado.
   * @returns Promise con un objeto User.
   */
  public async getUserInfo(): Promise<User> {
    const urlUser = `${environment.urlAuth}${RestRoutes.USER}`;
    return firstValueFrom(this.http.get<User>(urlUser, this.httpOptions));
  }

  /**
   * Emite evento de login con los datos del usuario.
   * @param user Objeto User con la información del usuario.
   */
  public loginEvent(user: User) {
    this.configObservable.next(user);
  }

  /**
   * Cierra la sesión del usuario, eliminando tokens y datos de sesión.
   */
  public logOut() {
    window.localStorage.clear();
    sessionStorage.clear();
    this.configObservable.next(null);
  }

  /**
   * Guarda el nombre de usuario en el localStorage.
   * @param username Nombre de usuario a guardar.
   */
  public saveUserName(username: string): void {
    window.localStorage.setItem(StringConstants.USERNAME_KEY, username);
  }

  /**
   * Guarda el token principal en el localStorage.
   * @param token Token a guardar.
   */
  public saveToken(token: string): void {
    window.localStorage.setItem(StringConstants.TOKEN_KEY, token);
  }

  /**
   * Obtiene el token principal almacenado en el localStorage.
   * @returns Token en formato string o cadena vacía si no existe.
   */
  public getToken(): string {
    return window.localStorage.getItem(StringConstants.TOKEN_KEY) ?? '';
  }

  /**
   * Obtiene el segundo token almacenado en el localStorage.
   * @returns Token en formato string o cadena vacía si no existe.
   */
  public getToken2(): string {
    return window.localStorage.getItem(StringConstants.TOKEN_KEY2) ?? '';
  }

  /**
   * Obtiene el token de PortalUsers almacenado en memoria.
   * @returns Token en formato string.
   */
  public getPortalUsersToken(): string {
    return this.portalUsersToken;
  }

  /**
   * Setea el token de PortalUsers en memoria.
   * @param token Token a almacenar.
   * @returns Token establecido.
   */
  public setPortalUsersToken(token: string): string {
    return (this.portalUsersToken = token);
  }

  /**
   * Elimina el token principal del localStorage.
   */
  public clearToken(): void {
    window.localStorage.removeItem(StringConstants.TOKEN_KEY);
  }

  /**
   * Login en el servicio de PortalUsers y guarda token y usuario.
   * @param userName Nombre de usuario.
   * @param password Contraseña del usuario.
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

    this.saveToken(result.token);
    this.saveUserName(userName);

    const userInfo = new User();
    userInfo.user = userName;
    userInfo.pwd = password;
    this.loginEvent(userInfo);
  }

  /**
   * Autoriza el cliente y guarda el segundo token en localStorage.
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
}
