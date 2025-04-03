import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { SalesReport } from '../_models/sales-report.model';

@Injectable({
  providedIn: 'root'
})
export class SalesReportService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  getSalesReport(fromDate:number, toDate:number, terminalNumber?: string, commerceId?: number): Observable<SalesReport> {

    let urlSalesReport: string = `${environment.urlWS}${RestRoutes.SALES_REPORT}${fromDate}${RestRoutes.PARAM_TODATE}${toDate}`;

    if (terminalNumber) {
      urlSalesReport += `${RestRoutes.PARAM_TERMINALNUMBER}${terminalNumber}`;
    }
    if (commerceId) {
      urlSalesReport += `${RestRoutes.PARAM_COMMERCEID}${commerceId}`;
    }

    return this.http.post<SalesReport>(urlSalesReport, this.httpOptions);
  }
}
