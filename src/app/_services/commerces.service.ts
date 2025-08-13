import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { Commerce } from '../_models/commerce.model';

/**
 * Servicio para gestionar operaciones relacionadas con comercios.
 */
@Injectable({ providedIn: 'root' })
export class CommercesService {

  private http = inject(HttpClient);

  private commerceId = new BehaviorSubject<number>(0);
  public commerceId$ = this.commerceId.asObservable();

  public httpOptions = {
    headers: new HttpHeaders({
      'accept': 'text/plain',
      'api-version': '4'
    })
  };

  /**
   * Obtiene la lista de comercios asociados al usuario.
   * @returns Observable con un array de objetos Commerce.
   */
  public getCommerceList(): Observable<Commerce[]> {
    const url = `${environment.urlWE}${RestRoutes.PORTALUSERS_COMMERCES}`;
    return this.http.get<Commerce[]>(url, this.httpOptions);
  }

  /**
   * Actualiza el comercio seleccionado.
   * @param commerceId Id del comercio a establecer.
   */
  public setCommerceId(commerceId: number): void {
    this.commerceId.next(commerceId);
  }
}
