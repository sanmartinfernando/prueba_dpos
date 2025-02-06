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

  GetSalesReport(fromDate:number, toDate:number): Observable<SalesReport> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.SALES_REPORT}${fromDate}${RestRoutes.SALES_REPORT2}${toDate}`;
    console.log(urlCommerces)
    return this.http.post<SalesReport>(urlCommerces, this.httpOptions);
  }
}
