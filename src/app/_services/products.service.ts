import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_config/rest-routes.config';
import { ProductInfo } from '../_models/product-info.model';
import { Product } from '../_models/product.model';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  httpOptions = {
    headers: new HttpHeaders(
      {
        'Content-type': 'application/json'
      }
    )
  };

  constructor(private http: HttpClient) { }

  public getProducts(size:number, searchParams: string): Observable<ProductInfo> {
    let urlProducts: string = `${environment.urlWS}${RestRoutes.PRODUCTS_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<ProductInfo>(urlProducts, this.httpOptions);
  }

  public getProductDetails(id:string): Observable<Product> {
    let urlProducts: string = `${environment.urlWS}${RestRoutes.PRODUCTS}${id}`;
    return this.http.get<Product>(urlProducts, this.httpOptions);
  }
}
