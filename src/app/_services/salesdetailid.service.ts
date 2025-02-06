import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { Order } from '../_models/order.model';

@Injectable({
  providedIn: 'root'
})
export class Salesdetailid {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetSalesDetail(id:string): Observable<Order> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.SALES_DETAILS}${id}`;
    console.log(urlCommerces)
    return this.http.get<Order>(urlCommerces, this.httpOptions);
  }
}
