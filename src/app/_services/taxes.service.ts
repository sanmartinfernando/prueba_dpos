import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { TaxInfo } from '../_models/tax-info.model';
import { Tax } from '../_models/tax.model';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class TaxesService {

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

  public getTaxes(size: number, searchParams: string): Observable<TaxInfo> {
    if (size === undefined || size === null || searchParams === undefined || searchParams === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlTaxes = `${environment.urlWS}${RestRoutes.TAXES_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<TaxInfo>(urlTaxes, this.httpOptions);
  }

  public getTaxesDetails(id: string): Observable<Tax> {
    if (id === undefined || id === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlTaxes = `${environment.urlWS}${RestRoutes.TAXES}${id}`;
    return this.http.get<Tax>(urlTaxes, this.httpOptions);
  }
}
