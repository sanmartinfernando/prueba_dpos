import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { Balance } from '../_models/balance.model';
import { BalanceInfo } from '../_models/balance-info.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * @class BalancesService
 * @description
 * Servicio para gestionar cierres de caja y obtener detalles e información agregada desde el backend.
 */
@Injectable({ providedIn: 'root' })
export class BalancesService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
    }),
  };

  /**
   * Obtiene el detalle de un cierre de caja por su ID.
   * 
   * @param id Identificador del cierre de caja.
   * @returns Observable que emite un Balance.
   * @throws Error si id es undefined o null.
   */
  public getBalanceDetail(id: string): Observable<Balance> {
    this.validateParams(id);
    const urlBalances = `${environment.urlWS}${RestRoutes.BALANCES}${id}`;
    return this.http.get<Balance>(urlBalances, this.httpOptions);
  }

  /**
   * Obtiene información agregada de los cierre de caja con parámetros de búsqueda.
   * 
   * @param size Tamaño de la página de resultados.
   * @param searchParams Parámetros de búsqueda en formato JSON.
   * @returns Observable que emite un BalanceInfo.
   * @throws Error si size o searchParams son undefined o null.
   */
  public getBalanceInfo(size: number, searchParams: string): Observable<BalanceInfo> {
    this.validateParams(size, searchParams);
    const urlBalancesInfo = `${environment.urlWS}${RestRoutes.BALANCES_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<BalanceInfo>(urlBalancesInfo, this.httpOptions);
  }

  /**
   * Valida que los parámetros no sean undefined ni null.
   * 
   * @param params Parámetros a validar.
   * @throws Error si algún parámetro es inválido.
   */
  private validateParams(...params: any[]): void {
    for (const param of params) {
      if (param === undefined || param === null) {
        throw new Error(this.translate.instant('dpos.error.msg.params'));
      }
    }
  }
}
