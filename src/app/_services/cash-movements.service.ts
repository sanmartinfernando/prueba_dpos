import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { OrderAggregation } from '../_models/order-aggregation.model';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class CashMovementsService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  public httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor() { }

  public getCashMovementsAggregate(searchParams: string): Observable<OrderAggregation[]> {
    if (searchParams === undefined || searchParams === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlCashMovements = `${environment.urlWS}${RestRoutes.CASH_MOVEMENTS_AGGREGATE}`;
    return this.http.post<OrderAggregation[]>(urlCashMovements, searchParams, this.httpOptions);
  }
}
