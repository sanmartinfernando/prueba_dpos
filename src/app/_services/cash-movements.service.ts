import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { OrderAggregation } from '../_models/order-aggregation.model';

@Injectable({
  providedIn: 'root'
})
export class CashMovementsService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  getCashMovementsAggregate(searchParams: string): Observable<OrderAggregation[]> {
    let urlCashMovements: string = `${environment.urlWS}${RestRoutes.CASH_MOVEMENTS_AGGREGATE}`;
    return this.http.post<OrderAggregation[]>(urlCashMovements, searchParams, this.httpOptions);
  }
}
