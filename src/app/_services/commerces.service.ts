import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { BehaviorSubject } from 'rxjs';
import { Commerce } from '../_models/commerce.model';

@Injectable({
  providedIn: 'root'
})
export class CommercesService {

  private http = inject(HttpClient);

  private commerceId = new BehaviorSubject<number>(0);
  public commerceId$ = this.commerceId.asObservable();
  public httpOptions = {
    headers: new HttpHeaders(
      {
        'accept': 'text/plain',
        'api-version': '4'
      }
    )
  };

  constructor() { }

  public getCommerceList(): Observable<Commerce[]> {
    const urlPortalUserCommerces = `${environment.urlWE}${RestRoutes.PORTALUSERS_COMMERCES}`;
    return this.http.get<Commerce[]>(urlPortalUserCommerces, this.httpOptions);
  }

  public setCommerceId(commerceId: number) {
    this.commerceId.next(commerceId);
  }
}
