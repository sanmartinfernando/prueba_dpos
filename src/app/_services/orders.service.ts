import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { OrderAggregation } from '../_models/order-aggregation.model';
import { Top3Aggregation } from '../_models/top3-aggregation.model';
import { OrderInfo } from '../_models/order-info.model';
import { Order } from '../_models/order.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * @class OrdersService
 * @description
 * Servicio para la gestión y obtención de información relacionada con ventas,
 * incluyendo agregaciones, detalles y datos resumidos.
 */
@Injectable({ providedIn: 'root' })
export class OrdersService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json'
    })
  };

  /**
   * Obtiene agregaciones de ventas.
   * 
   * @param searchParams Parámetros de búsqueda en formato string.
   * @returns Observable con la lista de agregaciones de ventas.
   */
  public getOrderAggregate(searchParams: string): Observable<OrderAggregation[]> {
    if (!searchParams) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const url = `${environment.urlWS}${RestRoutes.ORDERS_AGGREGATE}`;
    return this.http.post<OrderAggregation[]>(url, searchParams, this.httpOptions);
  }

  /**
   * Obtiene el top 3 de agregaciones de ventas.
   * 
   * @param searchParams Parámetros de búsqueda en formato string.
   * @returns Observable con el top 3 de agregaciones de ventas.
   */
  public getOrderTop3Aggregate(searchParams: string): Observable<Top3Aggregation[]> {
    if (!searchParams) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const url = `${environment.urlWS}${RestRoutes.ORDERS_AGGREGATE}`;
    return this.http.post<Top3Aggregation[]>(url, searchParams, this.httpOptions);
  }

  /**
   * Obtiene información detallada de ventas.
   * 
   * @param size Cantidad de registros a obtener.
   * @param qs Parámetros de búsqueda en formato string.
   * @returns Observable con la información de las ventas.
   */
  public getOrderInfo(size: number, qs: string): Observable<OrderInfo> {
    if (size == null || !qs) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('size', size.toString()).set('offset', '0').set('qs', qs);
    return this.http.get<OrderInfo>(`${environment.urlWS}${RestRoutes.ORDERS_INFO}`, { params, ...this.httpOptions });
  }

  /**
   * Obtiene el detalle de una venta específica.
   * 
   * @param id Identificador único de la venta.
   * @returns Observable con los datos de la venta.
   */
  public getOrderDetail(id: string): Observable<Order> {
    if (!id) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const url = `${environment.urlWS}${RestRoutes.ORDERS}${id}`;
    return this.http.get<Order>(url, this.httpOptions);
  }
}
