import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { OrderAggregation } from '../_models/order-aggregation.model';
import { Top3Aggregation } from '../_models/top3-aggregation.model';
import { OrderInfo } from '../_models/order-info.model';
import { Order } from '../_models/order.model';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class OrdersService {

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

  public getOrderAggregate(searchParams: string): Observable<OrderAggregation[]> {
    if (searchParams === undefined || searchParams === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlOrderAggregate = `${environment.urlWS}${RestRoutes.ORDERS_AGGREGATE}`;
    return this.http.post<OrderAggregation[]>(urlOrderAggregate, searchParams, this.httpOptions);
  }

  public getOrderTop3Aggregate(searchParams: string): Observable<Top3Aggregation[]> {
    if (searchParams === undefined || searchParams === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlOrderAggregate = `${environment.urlWS}${RestRoutes.ORDERS_AGGREGATE}`;
    return this.http.post<Top3Aggregation[]>(urlOrderAggregate, searchParams, this.httpOptions);
  }

  public getOrderInfo(size: number, searchParams: string): Observable<OrderInfo> {
    if (size === undefined || size === null || searchParams === undefined || searchParams === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlOrderInfo = `${environment.urlWS}${RestRoutes.ORDERS_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<OrderInfo>(urlOrderInfo, this.httpOptions);
  }

  public getOrderDetail(id: string): Observable<Order> {
    if (id === undefined || id === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlOrders = `${environment.urlWS}${RestRoutes.ORDERS}${id}`;
    return this.http.get<Order>(urlOrders, this.httpOptions);
  }
}
