import { Injectable } from '@angular/core';
import { Page } from 'src/app/_models/Page';

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  public pages : Page[] = [
    new Page('0','Productos','products'),
    new Page('1','Ventas','sales'),
    new Page('1','Clientes','clients'),
    new Page('1','Cierres  de caja ','balances')
];

  constructor() { }
}
