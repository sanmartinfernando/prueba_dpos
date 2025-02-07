import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { OrderAggregation } from '../_models/order-aggregation.model';
import { Top3Aggregation } from '../_models/top3-aggregation.model';
import { OrderInfo } from '../_models/order-info.model';
import { Order } from '../_models/order.model';


@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  public getOrderAggregate(searchParams: string): Observable<OrderAggregation[]> {
    let urlOrderAggregate: string = `${environment.urlWS}${RestRoutes.ORDERS_AGGREGATE}`;
    return this.http.post<OrderAggregation[]>(urlOrderAggregate, searchParams, this.httpOptions);
  }

  public getOrderTop3Aggregate(searchParams: string): Observable<Top3Aggregation[]> {
    let urlOrderAggregate: string = `${environment.urlWS}${RestRoutes.ORDERS_AGGREGATE}`;
    return this.http.post<Top3Aggregation[]>(urlOrderAggregate, searchParams, this.httpOptions);
  }

  public getOrderInfo(size:number, searchParams: string): Observable<OrderInfo> {
    let urlOrderInfo: string = `${environment.urlWS}${RestRoutes.ORDERS_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<OrderInfo>(urlOrderInfo, this.httpOptions);
  }

  public getOrderDetail(id:string): Observable<Order> {
    let urlOrders: string = `${environment.urlWS}${RestRoutes.ORDERS}${id}`;
    return this.http.get<Order>(urlOrders, this.httpOptions);
  }
}
