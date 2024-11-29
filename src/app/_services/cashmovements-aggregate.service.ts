import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { OrderAggregation } from '../_models/Orderaggregation.model';
import { OrderAggregationCash } from '../_models/OrderAggregationCash.model';

@Injectable({
  providedIn: 'root'
})
export class CashmovementsAggregateService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetAggregationCashMovements(searchParams): Observable<OrderAggregation[]> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.CASH_AGGREGATION}`;
    return this.http.post<OrderAggregation[]>(urlCommerces, searchParams, this.httpOptions);
  }

  GetAggregationCashMovementsEvo(searchParams): Observable<OrderAggregationCash[]> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.CASH_AGGREGATION}`;
    return this.http.post<OrderAggregationCash[]>(urlCommerces, searchParams, this.httpOptions);
  }

}


