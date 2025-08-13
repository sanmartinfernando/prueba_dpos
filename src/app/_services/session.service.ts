import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Commerce } from '../_models/commerce.model';

/**
 * Servicio de sesión para almacenar y gestionar datos
 * en sessionStorage y mantenerlos reactivos mediante BehaviorSubject.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {

  // Keys de comercio
  static readonly COMMERCE = 'commerce';
  static readonly COMMERCE_ID = 'commerceId';
  static readonly RESELLER_NAME = 'resellerName';
  static readonly TERMINAL_NUMBER = 'terminalNumber';

  // Keys de fechas y operaciones
  static readonly FROM_DATE = 'fromDate';
  static readonly TO_DATE = 'toDate';
  static readonly OP_TYPE = 'opType';
  static readonly DOC_NUMBER = 'docNumber';
  static readonly REPORT_TYPE = 'reportType';
  static readonly LANGUAGE = 'language';

  // Keys de cliente
  static readonly CUSTOMER_NIF = 'customerNif';
  static readonly CUSTOMER_NAME = 'customerName';
  static readonly CUSTOMER_LASTNAME = 'customerLastName';
  static readonly CUSTOMER_PHONE = 'customerPhone';
  static readonly CUSTOMER_EMAIL = 'customerEmail';

  // Keys de producto
  static readonly PRODUCT_NAME = 'productName';
  static readonly PRODUCT_REFERENCE = 'productReference';
  static readonly PRODUCT_BARCODE = 'productBarcode';

  private commerceId = new BehaviorSubject<number>(this.getItem(SessionService.COMMERCE_ID) || 0);
  private commerce = new BehaviorSubject<Commerce>(this.getItem(SessionService.COMMERCE) || null);

  /**
   * Guarda un valor en sessionStorage.
   * @param key Clave del elemento.
   * @param value Valor a almacenar.
   */
  public setItem(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Obtiene un valor de sessionStorage.
   * @param key Clave del elemento.
   * @returns Valor almacenado o null si no existe.
   */
  public getItem(key: string): any {
    const storedValue = sessionStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
  }

  /**
   * Elimina un elemento de sessionStorage.
   * @param key Clave del elemento a eliminar.
   */
  public removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * Limpia todos los datos de sessionStorage.
   */
  public clear(): void {
    sessionStorage.clear();
  }

  /**
   * Obtiene el BehaviorSubject del comercio.
   * @returns BehaviorSubject con el comercio.
   */
  public getCommerce(): BehaviorSubject<Commerce> {
    return this.commerce;
  }

  /**
   * Actualiza el BehaviorSubject del comercio.
   * @param commerce Objeto Commerce a establecer.
   */
  public setCommerce(commerce: Commerce): void {
    this.commerce.next(commerce);
  }

  /**
   * Obtiene el BehaviorSubject del ID del comercio.
   * @returns BehaviorSubject con el ID del comercio.
   */
  public getCommerceId(): BehaviorSubject<number> {
    return this.commerceId;
  }

  /**
   * Actualiza el BehaviorSubject del ID del comercio.
   * @param commerceId Nuevo ID del comercio.
   */
  public setCommerceId(commerceId: number): void {
    this.commerceId.next(commerceId);
  }
}
