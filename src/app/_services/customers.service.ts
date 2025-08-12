import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { CustomerInfo } from '../_models/customer-info.model';
import { Customer } from '../_models/customer.model';
import { TranslateService } from '@ngx-translate/core';


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

  public createCustomer(customer: Customer, commerceId: string): Observable<Customer> {
    if (customer === undefined || customer === null || commerceId === undefined || commerceId === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    
    let params = new HttpParams();
    params = params.set('commerceId', commerceId);

    const urlCustomers = `${environment.urlClients}${RestRoutes.CUSTOMERS}`;
    return this.http.post<Customer>(urlCustomers, customer, {headers: this.httpOptions.headers, params});
  }

  public updateCustomer(customer: Customer, commerceId: string): Observable<Customer> {
   if (customer === undefined || customer === null || customer.clientId === undefined || customer.clientId === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    let params = new HttpParams();
    params = params.set('commerceId', commerceId);

    const urlCustomers = `${environment.urlClients}${RestRoutes.CUSTOMERS}/${customer.clientId}`;
    return this.http.put<Customer>(urlCustomers, customer, {headers: this.httpOptions.headers, params});
  }

  public getCustomer(customerId: string, commerceId: string): Observable<Customer> {
    if (customerId === undefined || customerId === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    let params = new HttpParams();
    params = params.set('commerceId', commerceId);

    const urlCustomers = `${environment.urlClients}${RestRoutes.CUSTOMERS}/${customerId}`;
    return this.http.get<Customer>(urlCustomers, {headers: this.httpOptions.headers, params});
  }

  public getCustomers(size: number, searchParams: string): Observable<CustomerInfo> {
    const urlCustomers = `${environment.urlClients}${RestRoutes.CUSTOMERS_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<CustomerInfo>(urlCustomers, this.httpOptions);
  }
}
