import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { CustomerInfo } from '../_models/customer-info.model';
import { Customer } from '../_models/customer.model';
import { TranslateService } from '@ngx-translate/core';
import { CustomerResponse } from '../_models/customer-response.model';


@Injectable({
  providedIn: 'root'
})
export class CustomersService {

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

  public createCustomer(customer: Customer): Observable<CustomerResponse> {
    if (customer === undefined || customer === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlCustomers = `${environment.urlClients}${RestRoutes.CUSTOMERS}`;
    return this.http.post<CustomerResponse>(urlCustomers, customer, this.httpOptions);
  }

  public updateCustomer(id: string, customer: Customer): Observable<CustomerResponse> {
    if (customer === undefined || customer === null || id === undefined || id === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlCustomers = `${environment.urlClients}${RestRoutes.CUSTOMERS}${id}`;
    return this.http.put<CustomerResponse>(urlCustomers, customer, this.httpOptions);
  }

  public getCustomer(id: string): Observable<CustomerResponse> {
    if (id === undefined || id === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlCustomers = `${environment.urlClients}${RestRoutes.CUSTOMERS}${id}`;
    return this.http.get<CustomerResponse>(urlCustomers, this.httpOptions);
  }

  public getCustomers(size: number, searchParams: string): Observable<CustomerInfo> {
    const urlCustomers = `${environment.urlClients}${RestRoutes.CUSTOMERS_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<CustomerInfo>(urlCustomers, this.httpOptions);
  }
}
