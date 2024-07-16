import { Injectable } from '@angular/core';
import { Page } from 'src/app/_models/Page';

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  public pages : Page[] = [
    new Page('0','Dashboard','dashboard','fa-solid fa-square-poll-vertical'),
    new Page('1','Ventas','sales','fa-solid fa-chart-line'),
    new Page('1','Cierres','balances','fa-regular fa-chart-bar'),
    new Page('1','Informes','clients','fa-solid fa-chart-area')

];

  constructor() { }
}
