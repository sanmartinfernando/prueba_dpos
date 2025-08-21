import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { OrderAggregation } from '../_models/order-aggregation.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * @class CashMovementsService
 * @description
 * Servicio para gestionar movimientos de caja y obtener agregados desde el backend.
 */
@Injectable({ providedIn: 'root' })
export class CashMovementsService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
    }),
  };

  /**
   * Obtiene los agregados de los movimientos de caja según parámetros de búsqueda.
   * 
   * @param searchParams Parámetros de búsqueda en formato JSON.
   * @returns Observable que emite un arreglo de OrderAggregation.
   * @throws Error si searchParams es undefined o null.
   */
  public getCashMovementsAggregate(searchParams: string): Observable<OrderAggregation[]> {
    this.validateParams(searchParams);
    const urlCashMovements = `${environment.urlWS}${RestRoutes.CASH_MOVEMENTS_AGGREGATE}`;
    return this.http.post<OrderAggregation[]>(urlCashMovements, searchParams, this.httpOptions);
  }

  /**
   * Valida que el parámetro no sea undefined ni null.
   * 
   * @param param Parámetro a validar.
   * @throws Error si el parámetro es inválido.
   */
  private validateParams(param: any): void {
    if (param === undefined || param === null) {
      throw new Error(this.translate.instant('dpos.error.msg.params'));
    }
  }
}
