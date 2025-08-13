import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { ProductInfo } from '../_models/product-info.model';
import { Product } from '../_models/product.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * Servicio para gestionar la obtención de productos y sus detalles.
 * Proporciona métodos para consultar listados y detalles individuales.
 */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  public httpOptions = {
    headers: new HttpHeaders({ 'Content-type': 'application/json' })
  };

  /**
   * Obtiene un listado de productos filtrados por tamaño y parámetros de búsqueda.
   * @param size Cantidad de productos a obtener.
   * @param searchParams Parámetros de búsqueda en formato string.
   * @returns Observable con la información de los productos.
   */
  public getProducts(size: number, searchParams: string): Observable<ProductInfo> {
    if (size == null || searchParams == null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const url = `${environment.urlWS}${RestRoutes.PRODUCTS_INFO}${size}${RestRoutes.PARAM_OFFSET}${searchParams}`;
    return this.http.get<ProductInfo>(url, this.httpOptions);
  }

  /**
   * Obtiene los detalles de un producto específico.
   * @param id Identificador único del producto.
   * @returns Observable con la información del producto.
   */
  public getProductDetails(id: string): Observable<Product> {
    if (id == null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const url = `${environment.urlWS}${RestRoutes.PRODUCTS}${id}`;
    return this.http.get<Product>(url, this.httpOptions);
  }
}
