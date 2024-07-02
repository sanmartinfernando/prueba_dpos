import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor(private http: HttpClient) { }
  //Para mostrar las ventas del ws . Devolvera un objeto de tipo observable
  showSales(url:string){
    return this.http.get(url);
  }
  
}
