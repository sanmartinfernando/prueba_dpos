import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { SalesReport } from '../_models/sales-report.model';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class SalesReportService {

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

  public getSalesReport(fromDate: number, toDate: number, terminalNumber?: string, commerceId?: number): Observable<SalesReport> {
    if (fromDate === undefined || fromDate === null || toDate === undefined || toDate === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    let urlSalesReport = `${environment.urlWS}${RestRoutes.SALES_REPORT}${fromDate}${RestRoutes.PARAM_TODATE}${toDate}`;
    if (terminalNumber) {
      urlSalesReport += `${RestRoutes.PARAM_TERMINALNUMBER}${terminalNumber}`;
    }
    if (commerceId) {
      urlSalesReport += `${RestRoutes.PARAM_COMMERCEID}${commerceId}`;
    }
    return this.http.post<SalesReport>(urlSalesReport, this.httpOptions);
  }
}
