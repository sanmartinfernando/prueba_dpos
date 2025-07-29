import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { TaxInfo } from '../_models/tax-info.model';
import { Tax } from '../_models/tax.model';


@Injectable({
  providedIn: 'root'
})
export class TaxesService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  public getTaxes(size:number, searchParams: string): Observable<TaxInfo> {
    let urlTaxes: string = `${environment.urlWS}${RestRoutes.TAXES_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<TaxInfo>(urlTaxes, this.httpOptions);
  }

  public getTaxesDetails(id:string): Observable<Tax> {
    let urlTaxes: string = `${environment.urlWS}${RestRoutes.TAXES}${id}`;
    return this.http.get<Tax>(urlTaxes, this.httpOptions);
  }
}
