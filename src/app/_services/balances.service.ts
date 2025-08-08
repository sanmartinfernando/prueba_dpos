import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { Balance } from '../_models/balance.model';
import { BalanceInfo } from '../_models/balance-info.model';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class BalancesService {

  public httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient, private translate: TranslateService) { }

  public getBalanceDetail(id: string): Observable<Balance> {
    if (id === undefined || id === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    let urlBalances: string = `${environment.urlWS}${RestRoutes.BALANCES}${id}`;
    return this.http.get<Balance>(urlBalances, this.httpOptions);
  }

  public getBalanceInfo(size: number, searchParams: string): Observable<BalanceInfo> {
    if (size === undefined || size === null || searchParams === undefined || searchParams === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    let urlBalancesInfo: string = `${environment.urlWS}${RestRoutes.BALANCES_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<BalanceInfo>(urlBalancesInfo, this.httpOptions);
  }
}

