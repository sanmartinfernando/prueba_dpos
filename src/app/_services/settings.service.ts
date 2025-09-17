import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

/**
 * @class BalancesService
 * @description
 * Servicio para gestionar cierres de caja y obtener detalles e información agregada desde el backend.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
    }),
  };

  /**
   * Crea o actualiza la configuración de un comercio según tenga definido el commerceId.
   * Si commerceId no existe, se realiza un POST; de lo contrario, un PUT.
   * 
   * @param commerceSettings Objeto CommerceSettings con los datos de configuración del comercio
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el comercio creado o actualizado.
   */
  /*
  public saveCommerce(commerceSettings: CommerceSettings, commerceId: string): Observable<CommerceSettings> {
    /*
    if (!commerce || !commerceId || (commerce.commerceId === null)) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    const params = new HttpParams().set('commerceId', commerceId);
    const url = commerce.commerceId
      ? `${environment.urlSettings}${RestRoutes.COMMERCE}/${commerce.commerceId}`
      : `${environment.urlSettings}${RestRoutes.COMMERCE}`;

    return commerce.commerceId
      ? this.http.put<CommerceSettings>(url, commerce, { headers: this.httpOptions.headers, params })
      : this.http.post<CommerceSettings>(url, commerce, { headers: this.httpOptions.headers, params });
  }
  */

  private validateParams(...params: any[]): void {
    for (const param of params) {
      if (param === undefined || param === null) {
        throw new Error(this.translate.instant('dpos.error.msg.params'));
      }
    }
  }
}
