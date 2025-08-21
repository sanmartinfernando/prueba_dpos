import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { Product } from '../_models/product.model';
import { TranslateService } from '@ngx-translate/core';
import { Category } from '../_models/category.model';
import { Modifiers } from '../_models/modifiers.model';

/**
 * @class ProductsService
 * @description
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
   * Obtiene un producto específico por su ID.
   * 
   * @param productId Id del producto a obtener.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el producto obtenido.
   */
  public getProduct(productId: string, commerceId: string): Observable<Product> {
    if (!productId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlProducts}${RestRoutes.PRODUCTS}/${productId}`;
    return this.http.get<Product>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene el listado de productos de un comercio.
   * 
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el listado de productos.
   */
  public getAllProducts(commerceId: string): Observable<Product[]> {
    if (!commerceId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlProducts}${RestRoutes.PRODUCTS}/all`;
    return this.http.get<Product[]>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Crea o actualiza un producto según tenga definido el ID.
   * Si id no existe, se realiza un POST; de lo contrario, un PUT.
   * 
   * @param product Objeto Product con los datos del producto.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el producto creado o actualizado.
   */
  public saveProduct(product: Product, commerceId: string): Observable<Product> {
    if (!product || !commerceId || (product.productId === null)) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    const params = new HttpParams().set('commerceId', commerceId);
    const url = product.productId
      ? `${environment.urlProducts}${RestRoutes.PRODUCTS}/${product.productId}`
      : `${environment.urlProducts}${RestRoutes.PRODUCTS}`;

    return product.productId
      ? this.http.put<Product>(url, product, { headers: this.httpOptions.headers, params })
      : this.http.post<Product>(url, product, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene una categoría específica por su ID.
   * 
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
   * 
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
   * Crea o actualiza una categoría según tenga definido el ID.
   * Si id no existe, se realiza un POST; de lo contrario, un PUT.
   * 
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
   * Obtiene un modificador específico por su ID.
   * 
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
   * 
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

  /**
   * Crea o actualiza un modificador según tenga definido el ID.
   * Si el ID no existe, se realiza un POST; de lo contrario, un PUT.
   * 
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
}
