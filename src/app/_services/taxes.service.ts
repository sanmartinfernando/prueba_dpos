import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { TaxInfo } from '../_models/tax-info.model';
import { Tax } from '../_models/tax.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * Servicio encargado de gestionar las operaciones relacionadas con impuestos,
 * incluyendo la obtención de listas de impuestos y detalles de impuestos específicos.
 */
@Injectable({ providedIn: 'root' })
export class TaxesService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json'
    })
  };

  /**
   * Obtiene una lista de impuestos.
   * @param size Número de elementos a obtener.
   * @param searchParams Parámetros de búsqueda o filtrado.
   * @returns Observable con la información de impuestos.
   */
  public getTaxes(size: number, searchParams: string): Observable<TaxInfo> {
    if (!size && size !== 0 || !searchParams) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlTaxes = `${environment.urlWS}${RestRoutes.TAXES_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<TaxInfo>(urlTaxes, this.httpOptions);
  }

  /**
   * Obtiene los detalles de un impuesto específico.
   * @param id Identificador único del impuesto.
   * @returns Observable con los detalles del impuesto.
   */
  public getTaxesDetails(id: string): Observable<Tax> {
    if (!id) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlTaxes = `${environment.urlWS}${RestRoutes.TAXES}${id}`;
    return this.http.get<Tax>(urlTaxes, this.httpOptions);
  }
}
