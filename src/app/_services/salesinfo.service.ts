import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { OrderInfo } from '../_models/order-info.model';

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

  GetSalesInfo(size:number, searchParams: string): Observable<OrderInfo> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.SALES_INFO}${size}${RestRoutes.SALES_INFO2}${searchParams}`;
    console.log(urlCommerces)
    return this.http.get<OrderInfo>(urlCommerces, this.httpOptions);
  }
}
