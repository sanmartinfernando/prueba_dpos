import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { BalanceInfo } from '../_models/balance-info.model';

@Injectable({
  providedIn: 'root'
})
export class BalanceinfoService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetBalanceInfo(size:number, searchParams: string): Observable<BalanceInfo> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.BALANCES_INFO}${size}${RestRoutes.SALES_INFO2}${searchParams}`;
    console.log(urlCommerces)
    return this.http.get<BalanceInfo>(urlCommerces, this.httpOptions);
  }
}
