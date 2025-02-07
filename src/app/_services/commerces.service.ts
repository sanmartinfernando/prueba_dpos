import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { BehaviorSubject } from 'rxjs';
import { Commerce } from '../_models/commerce.model';

@Injectable({
  providedIn: 'root'
})
export class CommercesService {

  private commerceId= new BehaviorSubject<number>(0);
  commerceId$ = this.commerceId.asObservable();

  httpOptions = {
    headers: new HttpHeaders(
      {
        'accept': 'text/plain',
        'api-version': '4'
      }
    )
  };

  constructor(private http: HttpClient) { }

  getCommerceList(): Observable<Commerce[]> {
    let urlPortalUserCommerces: string = `${environment.urlWE}${RestRoutes.PORTALUSERS_COMMERCES}`;
    return this.http.get<Commerce[]>(urlPortalUserCommerces, this.httpOptions);
  }
  
  setCommerceId(commerceId: number) {
    this.commerceId.next(commerceId);
  }
}
