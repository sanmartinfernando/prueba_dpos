import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Data } from '@angular/router';

@Injectable()
export class DataServices {

  balances : any =[];
  filtroBalances: '';

  setData(data: import('@angular/router').Data[]) {
    throw new Error('Method not implemented.');
  }
  constructor(private httpClient: HttpClient) {}
  //peticion para mostrar los datos de 'cierres de caja'
  loadData(url) {
    return this.httpClient.get(url);
  }

  findId(index:any){
    let balancesId:Data=this.balances[index]
    return balancesId;
  }
}

  
