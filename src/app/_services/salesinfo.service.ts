import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BalanceId } from '../_models/BalanceId.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { SalesInfo } from '../_models/SalesInfo.model';

@Injectable({
  providedIn: 'root'
})
export class SalesinfoService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetSalesInfo(size:number, searchParams: string): Observable<SalesInfo> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.SALES_INFO}${size}${RestRoutes.SALES_INFO2}${searchParams}`;
    console.log(urlCommerces)
    return this.http.get<SalesInfo>(urlCommerces, this.httpOptions);
  }
}
