import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RestRoutes } from '../_config/rest-routes.config';
import { Observable } from 'rxjs';
import { PwResetModel } from '../_models/pwreset.model';
import { PwConditionsModel } from '../_models/PwConditions.model';
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

  PwResetMethod(parameters: any): Observable<PwResetModel> {
    let urlCommerces: string = `${environment.urlAuth}${RestRoutes.PW_RESET}`;
    return this.http.post<PwResetModel>(urlCommerces, parameters, this.httpOptions);
  }

  checkPwCond(): Observable<PwConditionsModel> {
    let urlCommerces: string = `${environment.urlAuth}${RestRoutes.PW_CONDITIONS}`;
    console.log(urlCommerces)
    return this.http.get<PwConditionsModel>(urlCommerces, this.httpOptions);
  }


}
