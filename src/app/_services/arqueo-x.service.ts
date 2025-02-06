import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { Balance } from '../_models/balance.model';


@Injectable({
  providedIn: 'root'
})
export class ArqueoXService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetArqueoX(fromDate:number, toDate:number): Observable<Balance> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.ARQUEO_X}${fromDate}${RestRoutes.ARQUEO_X2}${toDate}`;
    console.log(urlCommerces)
    return this.http.post<Balance>(urlCommerces, this.httpOptions);
  }
}
