import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RestRoutes } from '../_config/rest-routes.config';
import { environment } from 'src/environments/environment.dev-inte';

const TOKEN_KEY = 'dmf-token';
const USERNAME_KEY = 'dmf-username';

@Injectable({
  providedIn: 'root'
})
export class PwRecoverService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  localResponse

  constructor(private http: HttpClient) { }

  async PwRecovermethod(user: any): Promise<string> {
    let urlLogin: string = `${environment.urlAuth}${RestRoutes.PW_RECOVER}`;
    await fetch(urlLogin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(user)
    })
    return this.getToken(); // llamar al obs de actualizar usuario en todos lados
  }

  public getToken(): string {
    const token = window.localStorage.getItem(TOKEN_KEY);
    console.log(token)
    return token;
  }

}
