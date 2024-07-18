import { Injectable } from '@angular/core';
import { Page } from 'src/app/_models/Page';

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  public pages : Page[] = [
    new Page('0','Dashboard','dashboard','fi fi-rr-apps'),
    new Page('1','Ventas','sales','fi fi-rr-chat-arrow-grow'),
    new Page('1','Informes','clients','fi fi-rr-newspaper'),
    new Page('1','Cierres  de caja ','balances','fi fi-rs-point-of-sale-bill')

    /*new Page('0','Dashboard','dashboard','fa-solid fa-grip'),
    new Page('1','Ventas','sales','fa-solid fa-chart-line'),
    new Page('1','Clientes','clients','fa-solid fa-chart-area'),
    new Page('1','Cierres  de caja ','balances','fa-solid fa-cash-register')*/
];

  constructor() { }
}
