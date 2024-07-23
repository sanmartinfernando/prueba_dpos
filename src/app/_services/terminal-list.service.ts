import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { TerminalList } from '../_models/TerminalList.model';


@Injectable({
  providedIn: 'root'
})
export class TerminalListService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetTerminalList(): Observable<TerminalList> {
    let urlCommerces: string = `${environment.urlWE}${RestRoutes.TERMINAL_LIST}`;
    console.log(urlCommerces)
    return this.http.get<TerminalList>(urlCommerces, this.httpOptions);
  }
}
