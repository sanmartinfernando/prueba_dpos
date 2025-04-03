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

  getSalesReport(fromDate:number, toDate:number, searchParams?: string): Observable<SalesReport> {

    let urlSalesReport: string = `${environment.urlWS}${RestRoutes.SALES_REPORT}${fromDate}${RestRoutes.PARAM_TODATE}${toDate}`;
    // Si searchParams no es null o undefined, lo agregamos a la URL
    if (searchParams) {
      urlSalesReport += `${searchParams}`;
    }
    return this.http.post<SalesReport>(urlSalesReport, this.httpOptions);
  }
}
