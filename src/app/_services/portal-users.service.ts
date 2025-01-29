import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
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
}
