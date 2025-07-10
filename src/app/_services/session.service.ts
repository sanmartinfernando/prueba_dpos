import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  static readonly COMMERCE_ID:string = "commerceId";
  static readonly RESELLER_NAME:string = "resellerName";
  static readonly TERMINAL_NUMBER:string = "terminalNumber";
  static readonly FROM_DATE:string = "fromDate";
  static readonly TO_DATE:string = "toDate";
  static readonly OP_TYPE:string = "opType";
  static readonly DOC_NUMBER:string = "docNumber";
  static readonly REPORT_TYPE:string = "reportType";
  static readonly LANGUAGE:string = "language";

  private commerceId: BehaviorSubject<number> = new BehaviorSubject<number>(this.getItem(SessionService.COMMERCE_ID) || 0);

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

  getCommerceId(): BehaviorSubject<number> {
    return this.commerceId;
  }

  setCommerceId(commerceId:number):void {
    this.commerceId.next(commerceId);
  }
}