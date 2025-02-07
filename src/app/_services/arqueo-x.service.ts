import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { Balance } from '../_models/balance.model';


@Injectable({
  providedIn: 'root'
})
export class ArqueoXService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  public getArqueoX(fromDate:number, toDate:number): Observable<Balance> {
    let urlArqueoX: string = `${environment.urlWS}${RestRoutes.BALANCES_ARQUEO_X}${fromDate}${RestRoutes.PARAM_TODATE}${toDate}`;
    return this.http.post<Balance>(urlArqueoX, this.httpOptions);
  }
}
