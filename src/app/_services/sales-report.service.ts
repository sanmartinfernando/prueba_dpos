import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { OperationsReport } from '../_models/operations-report.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * @class OperationsReportService
 * @description
 * Servicio para la obtención de reportes de ventas.
 * Permite filtrar por fechas, número de terminal y comercio.
 */
@Injectable({ providedIn: 'root' })
export class OperationsReportService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  public httpOptions = {
    headers: new HttpHeaders({ 'Content-type': 'application/json' })
  };

  /**
   * Obtiene el reporte de ventas filtrado por fecha y opcionalmente por terminal y comercio.
   * 
   * @param fromDate Fecha inicial en formato numérico.
   * @param toDate Fecha final en formato numérico.
   * @param terminalNumber Número de terminal opcional.
   * @param commerceId Identificador de comercio opcional.
   * @returns Observable con el reporte de ventas.
   */
  public getOperationsReport(fromDate: number, toDate: number, terminalNumber?: string, commerceId?: number): Observable<OperationsReport> {
    if (fromDate == null || toDate == null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    let url = `${environment.urlWS}${RestRoutes.OPERATIONS_REPORT}${fromDate}${RestRoutes.PARAM_TODATE}${toDate}`;
    if (terminalNumber) {
      url += `${RestRoutes.PARAM_TERMINALNUMBER}${terminalNumber}`;
    }
    if (commerceId) {
      url += `${RestRoutes.PARAM_COMMERCEID}${commerceId}`;
    }
    return this.http.post<OperationsReport>(url, this.httpOptions);
  }
}
