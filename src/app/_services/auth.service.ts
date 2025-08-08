import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { User } from '../_models/user.model';
import { RestRoutes } from '../_rest/rest-routes.config';
import { LoginRequest } from '../_models/login-request.model';
import { StringConstants } from '../_rest/string-constants';
import { AuthRequest } from '../_models/auth-request.model';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public configObservable = new Subject<User>();
  public portalUsersToken: string;
  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  public static handleErrors(response) {
    if (!(response.status == 200 || response.status == 409)) {
      throw Error(response.statusText);
    }
    return response;
  }

  constructor(private http: HttpClient) { }

  async login(UserName: string, Password: string): Promise<string> {

    let urlLogin: string = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS}/login`;
    var loginRequest = new LoginRequest();
    loginRequest.userName = UserName;
    loginRequest.password = Password;
    await fetch(urlLogin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(loginRequest),
    })
      .then(AuthService.handleErrors)
      .then((response) => response.json())
      .then(async (result) => {
        this.saveToken(result.token);
        this.saveUserName(loginRequest.userName);
        let validation = await this.validate();
        var userInfo = new User();
        userInfo.user = loginRequest.userName;
        userInfo.pwd = loginRequest.password;
        this.loginEvent(userInfo);
      });

    let urlLogin2: string = `${environment.urlAuth}${RestRoutes.AUTH}/authorize`;
    var loginRequest2 = new AuthRequest();
    loginRequest2.clientKey = 'F0F0427E-FDDF-4A0F-910B-7FE1075BE366';
    loginRequest2.secretKey = 'j5$R8N3DB1my';
    await fetch(urlLogin2, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(loginRequest2),
    })
      .then(AuthService.handleErrors)
      .then((response) => response.json())
      .then(async (result) => {
        window.localStorage.removeItem(StringConstants.TOKEN_KEY2);
        window.localStorage.setItem(StringConstants.TOKEN_KEY2, result.token);
        let validation = await this.validate();
      });
    return this.getToken();
  }

  async validate(): Promise<object> {
    let url: string = `${environment.urlAuth}${RestRoutes.AUTH}/validate`;
    return firstValueFrom(this.http.post(url, this.httpOptions));
  }

  async getUserInfo(): Promise<User> {
    let urlUser: string = `${environment.urlAuth}${RestRoutes.USER}`;
    return firstValueFrom(this.http.get<User>(urlUser, this.httpOptions));
  }

  public loginEvent(user: User) {
    this.configObservable.next(user);
  }

  public logOut() {
    window.localStorage.clear();
    sessionStorage.clear();
    this.configObservable.next(null);
  }

  public saveUserName(username: any): void {
    window.localStorage.removeItem(StringConstants.USERNAME_KEY);
    window.localStorage.setItem(StringConstants.USERNAME_KEY, username); //
  }

  public saveToken(token: any): void {
    window.localStorage.removeItem(StringConstants.TOKEN_KEY);
    window.localStorage.setItem(StringConstants.TOKEN_KEY, token); //
  }

  public getToken(): string {
    const token = window.localStorage.getItem(StringConstants.TOKEN_KEY);
    if (token) {
      return token;
    }
    return '';
  }

  public getToken2(): string {
    const token = window.localStorage.getItem(StringConstants.TOKEN_KEY2);
    if (token) {
      return token;
    }
    return '';
  }

  public getPortalUsersToken() {
    return this.portalUsersToken;
  }

  public setPortalUsersToken(token: string) {
    return this.portalUsersToken = token;
  }

  public clearToken(): void {
    window.localStorage.removeItem(StringConstants.TOKEN_KEY);
  }
}
