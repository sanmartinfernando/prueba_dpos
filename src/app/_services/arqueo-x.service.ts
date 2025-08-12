import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { Balance } from '../_models/balance.model';


@Injectable({
  providedIn: 'root'
})
export class ArqueoXService {
  
  private http = inject(HttpClient);

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  public getArqueoX(fromDate: number, toDate: number, terminalNumber?: string, commerceId?: number): Observable<Balance> {
    let urlArqueoX = `${environment.urlWS}${RestRoutes.BALANCES_ARQUEO_X}${fromDate}${RestRoutes.PARAM_TODATE}${toDate}`;
    if (terminalNumber) {
      urlArqueoX += `${RestRoutes.PARAM_TERMINALNUMBER}${terminalNumber}`;
    }
    if (commerceId) {
      urlArqueoX += `${RestRoutes.PARAM_COMMERCEID}${commerceId}`;
    }
    return this.http.post<Balance>(urlArqueoX, this.httpOptions);
  }
}
