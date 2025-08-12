import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { ProductInfo } from '../_models/product-info.model';
import { Product } from '../_models/product.model';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  public httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  public getProducts(size: number, searchParams: string): Observable<ProductInfo> {
    if (size === undefined || size === null || searchParams === undefined || searchParams === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlProducts = `${environment.urlWS}${RestRoutes.PRODUCTS_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<ProductInfo>(urlProducts, this.httpOptions);
  }

  public getProductDetails(id: string): Observable<Product> {
    if (id === undefined || id === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const urlProducts = `${environment.urlWS}${RestRoutes.PRODUCTS}${id}`;
    return this.http.get<Product>(urlProducts, this.httpOptions);
  }
}
