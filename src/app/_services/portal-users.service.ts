import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { Commerce } from '../_models/Commerce.model';
import { Terminal } from '../_models/Terminal.model';
import { PortalUserToken } from '../_models/PortalUserToken.model';


@Injectable({
  providedIn: 'root'
})
export class PortalUsersService {

    constructor(private http: HttpClient) { }
    
    GetToken(): Observable<PortalUserToken> {

      let urlPortalUsersLogin: string = `${environment.urlAuth}${RestRoutes.PORTALUSERS_LOGIN}`;
      
      const loginRequest = {
        userName: "jtremin@diusframi.es",
        password: "12345678aA!"
      }
      
      return this.http.post<PortalUserToken>(urlPortalUsersLogin, loginRequest);
    }

    GetCommerces(): Observable<Commerce[]> {

      let httpOptions = {
        headers: new HttpHeaders(
          {
            'accept': 'text/plain',
            'api-version': '4'
          }
        )
      };

      
      let urlPortalUserCommerces: string = `${environment.urlWE}${RestRoutes.PORTALUSERS_COMMERCES}`;
      return this.http.get<Commerce[]>(urlPortalUserCommerces, httpOptions);
    }
    
    GetTerminals(): Observable<Terminal[]> {

      let httpOptions = {
        headers: new HttpHeaders(
          {
            'accept': 'text/plain',
            'Api-Version': '4'
          }
        )
      };

      let urlPortalUserTerminals: string = `${environment.urlWE}${RestRoutes.PORTALUSERS_TERMINALS}`;
      return this.http.get<Terminal[]>(urlPortalUserTerminals, httpOptions);
    }
}
