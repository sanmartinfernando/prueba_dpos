import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { PortalUserToken } from '../_models/portal-user-token.model';
import { User } from '../_models/user.model';
import { PwdProperties } from '../_models/pwd-properties.model';
import { PwdReset } from '../_models/pwd-reset.model';


const TOKEN_KEY = 'dmf-token';


@Injectable({
  providedIn: 'root'
})
export class PortalUsersService {

  private http = inject(HttpClient);

  public httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor() { }

  public getToken(user: User): Observable<PortalUserToken> {
    const loginRequest = {
      userName: user.user,
      password: user.pwd
    }
    const urlPortalUsers = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS_LOGIN}`;
    return this.http.post<PortalUserToken>(urlPortalUsers, loginRequest);
  }

  public resetPwd(parameters: any): Observable<PwdReset> {
    const urlPortalUsers = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS_PWD_RESET}`;
    return this.http.post<PwdReset>(urlPortalUsers, parameters, this.httpOptions);
  }

  public checkPwdProperties(): Observable<PwdProperties> {
    const urlPortalUsers = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS_PWD_PROPERTIES}`;
    return this.http.get<PwdProperties>(urlPortalUsers, this.httpOptions);
  }

  async recoverPwd(user: any): Promise<string> {
    const urlPortalUsers = `${environment.urlAuth}${RestRoutes.AUTH_PORTALUSERS_PWD_RECOVER}`;
    await fetch(urlPortalUsers, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(user)
    })
    return this.getTokenKey();
  }

  public getTokenKey(): string {
    const token = window.localStorage.getItem(TOKEN_KEY);
    return token;
  }
}
