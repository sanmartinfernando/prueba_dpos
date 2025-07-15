import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { OrderInfo } from '../_models/order-info.model';
import { Order } from '../_models/order.model';
import { CustomerInfo } from '../_models/customer-info.model';
import { Customer } from '../_models/customer.model';


@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  public getCustomers(size:number, searchParams: string): Observable<CustomerInfo> {
    let urlCustomers: string = `${environment.urlWS}${RestRoutes.CUSTOMERS_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<CustomerInfo>(urlCustomers, this.httpOptions);
  }

  public getCustomerDetails(id:string): Observable<Customer> {
    let urlCustomers: string = `${environment.urlWS}${RestRoutes.CUSTOMERS_INFO}${id}`;
    return this.http.get<Customer>(urlCustomers, this.httpOptions);
  }
}
