import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { ProductInfo } from '../_models/product-info.model';
import { Product } from '../_models/product.model';
import { TranslateService } from '@ngx-translate/core';
import { Category } from '../_models/category.model';
import { Modifiers } from '../_models/modifiers.model';

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

  /**
   * Crea o actualiza una categoría según tenga definido el ID.
   * Si id no existe, se realiza un POST; de lo contrario, un PUT.
   * @param category Objeto Category con los datos de la categoría.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con la categoría creada o actualizada.
   */
  public saveCategory(category: Category, commerceId: string): Observable<Category> {
    if (!category || !commerceId || (category.categoryId === null)) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    const params = new HttpParams().set('commerceId', commerceId);
    const url = category.categoryId
      ? `${environment.urlProducts}${RestRoutes.CATEGORIES}/${category.categoryId}`
      : `${environment.urlProducts}${RestRoutes.CATEGORIES}`;

    return category.categoryId
      ? this.http.put<Category>(url, category, { headers: this.httpOptions.headers, params })
      : this.http.post<Category>(url, category, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene una categoría específica por su ID.
   * @param categoryId Id de la categoría a obtener.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con la categoría obtenida.
   */
  public getCategory(categoryId: string, commerceId: string): Observable<Category> {
    if (!categoryId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlProducts}${RestRoutes.CATEGORIES}/${categoryId}`;
    return this.http.get<Category>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene el listado de categorías de un comercio.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el listado de categorías.
   */
  public getAllCategories(commerceId: string): Observable<Category[]> {
    if (!commerceId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlProducts}${RestRoutes.CATEGORIES}/all`;
    return this.http.get<Category[]>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Crea o actualiza un modificador según tenga definido el ID.
   * Si el ID no existe, se realiza un POST; de lo contrario, un PUT.
   * @param modifiers Objeto Modifier con los datos del modificador.
   * @param commerceId ID del comercio asociado.
   * @returns Observable con el modificador creado o actualizado.
   */
  public saveModifier(modifiers: Modifiers, commerceId: string): Observable<Modifiers> {
    if (!modifiers || !commerceId || (modifiers.modifierId === null)) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    const params = new HttpParams().set('commerceId', commerceId);
    const url = modifiers.modifierId
      ? `${environment.urlProducts}${RestRoutes.MODIFIERS}/${modifiers.modifierId}`
      : `${environment.urlProducts}${RestRoutes.MODIFIERS}`;

    return modifiers.modifierId
      ? this.http.put<Modifiers>(url, modifiers, { headers: this.httpOptions.headers, params })
      : this.http.post<Modifiers>(url, modifiers, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene un modificador específico por su ID.
   * @param modifierId Id del modificador a obtener.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el modificador obtenido.
   */
  public getModifier(modifierId: string, commerceId: string): Observable<Modifiers> {
    if (!modifierId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlProducts}${RestRoutes.MODIFIERS}/${modifierId}`;
    return this.http.get<Modifiers>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene el listado de modificadores de un comercio.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el listado de modificadores.
   */
  public getAllModifiers(commerceId: string): Observable<Modifiers[]> {
    if (!commerceId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlProducts}${RestRoutes.MODIFIERS}/all`;
    return this.http.get<Modifiers[]>(url, { headers: this.httpOptions.headers, params });
  }
}
