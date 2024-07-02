import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const AUTH_API = environment.urlWS;

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  url:string = "https://localhost:44336/api/Languages/GetLanguagesV2";

  constructor(private http: HttpClient) {}

  GetLanguages(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.get(this.url,httpOptions);
  }

}
