import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { Terminal } from '../_models/terminal.model';


@Injectable({
  providedIn: 'root'
})
export class TerminalsService {

  private http = inject(HttpClient);

  public httpOptions = {
    headers: new HttpHeaders(
      {
        'accept': 'text/plain',
        'Api-Version': '4'
      }
    )
  };

  constructor() { }

  public getTerminalList(): Observable<Terminal[]> {
    const urlPortalUserTerminals = `${environment.urlWE}${RestRoutes.PORTALUSERS_TERMINALS}`;
    return this.http.get<Terminal[]>(urlPortalUserTerminals, this.httpOptions);
  }
}
