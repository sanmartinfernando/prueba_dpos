import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { Balance } from '../_models/balance.model';

@Injectable({
  providedIn: 'root'
})
export class Balancedetailid {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetBalanceDetail(id:string): Observable<Balance> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.BALANCES_DETAILS}${id}`;
    console.log(urlCommerces)
    return this.http.get<Balance>(urlCommerces, this.httpOptions);
  }
}
