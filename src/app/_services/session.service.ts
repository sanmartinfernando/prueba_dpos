import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Commerce } from '../_models/commerce.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  static readonly COMMERCE:string = "commerce";
  static readonly COMMERCE_ID:string = "commerceId";
  static readonly RESELLER_NAME:string = "resellerName";
  static readonly TERMINAL_NUMBER:string = "terminalNumber";
  static readonly FROM_DATE:string = "fromDate";
  static readonly TO_DATE:string = "toDate";
  static readonly OP_TYPE:string = "opType";
  static readonly DOC_NUMBER:string = "docNumber";
  static readonly REPORT_TYPE:string = "reportType";
  static readonly LANGUAGE:string = "language";
  static readonly CUSTOMER_NIF:string = "customerNif";
  static readonly CUSTOMER_NAME:string = "customerName";
  static readonly CUSTOMER_LASTNAME:string = "customerLastName";
  static readonly CUSTOMER_PHONE:string = "customerPhone";
  static readonly CUSTOMER_EMAIL:string = "customerEmail";
  static readonly PRODUCT_NAME:string = "productName";
  static readonly PRODUCT_REFERENCE:string = "productReference";
  static readonly PRODUCT_BARCODE:string = "productBarcode";

  private commerceId: BehaviorSubject<number> = new BehaviorSubject<number>(this.getItem(SessionService.COMMERCE_ID) || 0);
  private commerce: BehaviorSubject<Commerce> = new BehaviorSubject<Commerce>(this.getItem(SessionService.COMMERCE) || null);

  // Método para guardar un valor en sessionStorage
  setItem(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value)); // Guardar como JSON
  }

  // Método para recuperar un valor de sessionStorage
  getItem(key: string): any {
    const storedValue = sessionStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null; // Si no hay nada, devuelve null
  }

  // Método para eliminar un valor de sessionStorage
  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  // Método para limpiar todo el sessionStorage
  clear(): void {
    sessionStorage.clear();
  }

  getCommerce(): BehaviorSubject<Commerce> {
    return this.commerce;
  }

  setCommerce(commerce:Commerce):void {
    this.commerce.next(commerce);
  }

  getCommerceId(): BehaviorSubject<number> {
    return this.commerceId;
  }

  setCommerceId(commerceId:number):void {
    this.commerceId.next(commerceId);
  }
}