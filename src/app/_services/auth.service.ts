import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { User } from '../_models/user.model';
import Helper from '../_helpers/helper';
import { RestRoutes } from '../_config/rest-routes.config';
import { LoginRequest } from '../_models/LoginRequest.model';
import { StringConstants } from '../_config/string-constants';

const httpOptions = {
  headers: new HttpHeaders(
    {
      'Content-Type': 'application/json'
    }
  )
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public configObservable = new Subject<User>();

  isLoggedIn: boolean = false;
  _storageService;

  constructor(private http: HttpClient) { }

  async login(UserName: string, Password: string): Promise<string> {
    let urlLogin: string = `${environment.urlAuth}${RestRoutes.AUTH}/login`;
    console.log(urlLogin)
    var loginRequest = new LoginRequest();
    loginRequest.userName=UserName;
    loginRequest.password = Password;
    console.log(loginRequest);
    await fetch(urlLogin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(loginRequest)
    })
      .then(Helper.handleErrors)
      .then((response) => response.json())
      .then(async (result) => {
        console.log(result);
        this.saveToken(result.token);
        this.saveUserName(loginRequest.userName);
        let validation = await this.validate();
        console.log(validation);
        var userInfo = new User();
        userInfo.user = loginRequest.userName;
        this.loginEvent(userInfo);
      });
    return this.getToken(); // llamar al obs de actualizar usuario en todos lados
  }


  async validate(): Promise<object> {
    let url: string = `${environment.urlAuth}${RestRoutes.AUTH}/validate`;
    return firstValueFrom(this.http.post(url, httpOptions));
  }

  async getUserInfo(): Promise<User> {
    let urlUser: string = `${environment.urlAuth}${RestRoutes.USER}`;
    return firstValueFrom(this.http.get<User>(urlUser, httpOptions));
  }
  loginEvent(user: User) {
    this.configObservable.next(user);
  }
  setLoggedIn() {
    this.isLoggedIn = true;
  }

  getLoggedIn() {
    return this.isLoggedIn;
  }

  logOut() {
    window.localStorage.clear();
    this.configObservable.next(null);
  }

  public saveUserName(username: any): void {
    console.log('save:'+username);
    window.localStorage.removeItem(StringConstants.USERNAME_KEY);
    window.localStorage.setItem(StringConstants.USERNAME_KEY, username);//
  }

  public saveToken(token: any): void {
    window.localStorage.removeItem(StringConstants.TOKEN_KEY);
    window.localStorage.setItem(StringConstants.TOKEN_KEY, token);//
  }

  public getToken(): string {
    const token = window.localStorage.getItem(StringConstants.TOKEN_KEY);
    if (token) {
      return token;
    }
    return "";
  }

  public clearToken(): void {
    window.localStorage.removeItem(StringConstants.TOKEN_KEY);
  }

}
