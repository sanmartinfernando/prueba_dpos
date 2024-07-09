import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BalanceId } from '../_models/BalanceId.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';

@Injectable({
  providedIn: 'root'
})
export class BalanceidService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetBalanceId(ID: string): Observable<BalanceId> {
    let urlCommerces: string = `${environment.urlWS}${RestRoutes.BALANCE_ID}${ID}`;
    return this.http.get<BalanceId>(urlCommerces, this.httpOptions);
  }
}
