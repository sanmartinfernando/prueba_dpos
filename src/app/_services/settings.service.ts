import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';

/**
 * @class SettingsService
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


  private validateParams(...params: any[]): void {
    for (const param of params) {
      if (param === undefined || param === null) {
        throw new Error(this.translate.instant('dpos.error.msg.params'));
      }
    }
  }

public getSettingsCommerce(commerceId: string): Observable<any> {
    this.validateParams(commerceId);
  
    const url = `${environment.urlSettings}${RestRoutes.SETTINGS_COMMERCE}${commerceId}`;
  
    return this.http.get<any>(url); 
  }

  public updateSettings(commerceId: string, settings: any): Observable<any> {
    this.validateParams(commerceId, settings);
    const url = `${environment.urlSettings}${RestRoutes.SETTINGS_COMMERCE}/${commerceId}`;
    return this.http.put<any>(url, settings);
  }

  public getAllTaxes(): Observable<any[]> {
    const url = `${environment.urlSettings}${RestRoutes.TAXES_COMMERCE}`;
    return this.http.get<any[]>(url);
  }
}
