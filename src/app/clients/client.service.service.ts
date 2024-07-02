import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Data } from '@angular/router';

@Injectable()
export class ClientServiceService {

  clients : any =[];
  filtroClients: '';

  setData(data: import('@angular/router').Data[]) {
    throw new Error('Method not implemented.');
  }
  constructor(private httpClient: HttpClient) {}
  //peticion para mostrar los datos
  loadData(url) {
    return this.httpClient.get(url);
  }

  findId(index:any){
    let clientsId:Data=this.clients[index]
    return clientsId;
  }

}