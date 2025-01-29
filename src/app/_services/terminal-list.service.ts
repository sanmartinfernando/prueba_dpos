import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { Terminal } from '../_models/Terminal.model';


@Injectable({
  providedIn: 'root'
})
export class TerminalListService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'accept': 'text/plain',
        'Api-Version': '4'
      }
    )
  };

  constructor(private http: HttpClient) { }

  GetTerminalList(): Observable<Terminal[]> {
    let urlPortalUserTerminals: string = `${environment.urlWE}${RestRoutes.PORTALUSERS_TERMINALS}`;
          return this.http.get<Terminal[]>(urlPortalUserTerminals, this.httpOptions);
  }
  
}
