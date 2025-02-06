import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RestRoutes } from '../_config/rest-routes.config';
import { Observable } from 'rxjs';
import { PwdReset } from '../_models/pwd-reset.model';
import { PwdConditions } from '../_models/pwd-conditions.model';
import { environment } from 'src/environments/environment.dev-inte';


@Injectable({
  providedIn: 'root'
})
export class PwresetService {

  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  PwResetMethod(parameters: any): Observable<PwdReset> {
    let urlCommerces: string = `${environment.urlAuth}${RestRoutes.PW_RESET}`;
    return this.http.post<PwdReset>(urlCommerces, parameters, this.httpOptions);
  }

  checkPwCond(): Observable<PwdConditions> {
    let urlCommerces: string = `${environment.urlAuth}${RestRoutes.PW_CONDITIONS}`;
    console.log(urlCommerces)
    return this.http.get<PwdConditions>(urlCommerces, this.httpOptions);
  }


}
