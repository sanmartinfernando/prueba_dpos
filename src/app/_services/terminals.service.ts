import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { Terminal } from '../_models/terminal.model';


@Injectable({
  providedIn: 'root'
})
export class TerminalsService {

  public httpOptions = {
    headers: new HttpHeaders(
      {
        'accept': 'text/plain',
        'Api-Version': '4'
      }
    )
  };

  constructor(private http: HttpClient) { }

  public getTerminalList(): Observable<Terminal[]> {
    let urlPortalUserTerminals: string = `${environment.urlWE}${RestRoutes.PORTALUSERS_TERMINALS}`;
    return this.http.get<Terminal[]>(urlPortalUserTerminals, this.httpOptions);
  }
}
