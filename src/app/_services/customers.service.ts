import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { CustomerInfo } from '../_models/customer-info.model';
import { Customer } from '../_models/customer.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * @class CustomersService
 * @description
 * Servicio para gestionar operaciones relacionadas con clientes.
 */
@Injectable({ providedIn: 'root' })
export class CustomersService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  /**
   * Crea o actualiza un cliente según tenga definido el clientId.
   * Si clientId no existe, se realiza un POST; de lo contrario, un PUT.
   * 
   * @param customer Objeto Customer con los datos del cliente.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el cliente creado o actualizado.
   */
  public saveCustomer(customer: Customer, commerceId: string): Observable<Customer> {
    if (!customer || !commerceId || (customer.clientId === null)) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    const params = new HttpParams().set('commerceId', commerceId);
    const url = customer.clientId
      ? `${environment.urlClients}${RestRoutes.CUSTOMER}/${customer.clientId}`
      : `${environment.urlClients}${RestRoutes.CUSTOMER}`;

    return customer.clientId
      ? this.http.put<Customer>(url, customer, { headers: this.httpOptions.headers, params })
      : this.http.post<Customer>(url, customer, { headers: this.httpOptions.headers, params });
  }

  /**
   * Elimina un cliente según por su ID.
   * 
   * @param clientId Id del cliente que se quiere eliminar.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el cliente eliminado.
   */
  public deleteCustomer(clientId: string, commerceId: string): Observable<number> {
    if (!clientId || !commerceId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlClients}${RestRoutes.CUSTOMER}/${clientId}`;
    return this.http.delete<number>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene un cliente específico por su ID.
   * 
   * @param customerId Id del cliente a obtener.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el cliente obtenido.
   */
  public getCustomer(customerId: string, commerceId: string): Observable<Customer> {
    if (!customerId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlClients}${RestRoutes.CUSTOMER}/${customerId}`;
    return this.http.get<Customer>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene un listado de clientes con información agregada según los parámetros de búsqueda.
   * 
   * @param size Cantidad de resultados a obtener.
  * @param commerceId ID del comercio. 
  * @param searchParams Parámetros de búsqueda y paginación.
   * @returns Observable con información de clientes.
   */
  /*
  public getCustomers(size: number, commerceId: string, searchParams: string): Observable<CustomerInfo> {
    const url = `${environment.urlClients}${RestRoutes.CUSTOMERS_INFO}${size}${RestRoutes.PARAM_OFFSET}${RestRoutes.PARAM_COMMERCEID}${commerceId}${searchParams}`;
    return this.http.get<CustomerInfo>(url, this.httpOptions);
  }
  */
  public getCustomers(size: number,commerceId: string, qs?: string): Observable<CustomerInfo> {
    let params = new HttpParams().set('size', size.toString()).set('offset', "0").set('commerceId', commerceId);
    if (qs) {
      params = params.set('qs', qs);
    }
    return this.http.get<CustomerInfo>(`${environment.urlClients}${RestRoutes.CUSTOMERS_INFO}`, { params, ...this.httpOptions });
  }
}
