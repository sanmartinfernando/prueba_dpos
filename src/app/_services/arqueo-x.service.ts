import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RestRoutes } from '../_rest/rest-routes.config';
import { Balance } from '../_models/balance.model';

/**
 * @class ArqueoXService
 * @description
 * Servicio para obtener información de los arqueos X desde el backend.
 */
@Injectable({ providedIn: 'root' })
export class ArqueoXService {

  private http = inject(HttpClient);

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
    }),
  };

  /**
   * Obtiene los datos del arqueo X según fecha, terminal y comercio.
   * 
   * @param fromDate Fecha de inicio en timestamp.
   * @param toDate Fecha de fin en timestamp.
   * @param terminalNumber Número de terminal (opcional).
   * @param commerceId Identificador de comercio (opcional).
   * @returns Observable que emite un Balance con los datos del arqueo.
   */
  public getArqueoX(fromDate: number, toDate: number, terminalNumber?: string, commerceId?: number): Observable<Balance> {
    let urlArqueoX = `${environment.urlWS}${RestRoutes.BALANCES_ARQUEO_X}${fromDate}${RestRoutes.PARAM_TODATE}${toDate}`;
    if (terminalNumber) {
      urlArqueoX += `${RestRoutes.PARAM_TERMINALNUMBER}${terminalNumber}`;
    }
    if (commerceId) {
      urlArqueoX += `${RestRoutes.PARAM_COMMERCEID}${commerceId}`;
    }
    return this.http.post<Balance>(urlArqueoX, this.httpOptions);
  }
}
