import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { OrderAggregation } from '../_models/Orderaggregation.model';
import { OrderAggregationCash } from '../_models/OrderAggregationCash.model';
import { OrderAggregationTop3 } from '../_models/Top3Sales.model';


@Injectable({
  providedIn: 'root'
})
export class OrdersAggregateService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetAggregationOrder(searchParams): Observable<OrderAggregation[]> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.ORDER_AGGREGATION}`;
    return this.http.post<OrderAggregation[]>(urlCommerces, searchParams, this.httpOptions);
  }

  GetAggregationOrderEvo(searchParams): Observable<OrderAggregationCash[]> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.ORDER_AGGREGATION}`;
    return this.http.post<OrderAggregationCash[]>(urlCommerces, searchParams, this.httpOptions);
  }

  GetAggregationOrderTop3(searchParams): Observable<OrderAggregationTop3[]> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.ORDER_AGGREGATION}`;
    return this.http.post<OrderAggregationTop3[]>(urlCommerces, searchParams, this.httpOptions);
  }
}
