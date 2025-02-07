import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { Balance } from '../_models/balance.model';
import { BalanceInfo } from '../_models/balance-info.model';

@Injectable({
  providedIn: 'root'
})
export class BalancesService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  getBalanceDetail(id:string): Observable<Balance> {
    let urlBalances: string = `${environment.urlWS}${RestRoutes.BALANCES}${id}`;
    return this.http.get<Balance>(urlBalances, this.httpOptions);
  }

  getBalanceInfo(size:number, searchParams: string): Observable<BalanceInfo> {
    let urlBalancesInfo: string = `${environment.urlWS}${RestRoutes.BALANCES_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<BalanceInfo>(urlBalancesInfo, this.httpOptions);
  }
}
