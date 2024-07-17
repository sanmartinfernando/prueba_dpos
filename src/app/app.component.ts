import { Component } from '@angular/core';
import { NgxChartsModule }from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'DPOSW-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DIU.Web.Angular.QuickShop.Client';

  dataset0 =[
    { name: "Tarjeta", value: 77},
    { name: "Efectivo", value: 33}
  ]

  activeEntries =[{ name: "Efectivo", value: 33}]



  dataset = [
    { name: "Ene", value: 1680},
    { name: "Feb", value: 1840},
    { name: "Mar", value: 1230},
    { name: "Abr", value: 1680},
    { name: "May", value: 1840},
    { name: "Jun", value: 1230},
    { name: "Jul", value: 920},
    { name: "Ago", value: 880},
    { name: "Sep", value: 1230},
    { name: "Oct", value: 1680},
    { name: "Nov", value: 2800},
    { name: "Dic", value: 3345}
  ];

  formatDataLabel(value )
  {
    return value + ' €';
  }

  customCorlors = [
    { name: "Ene", value: '#000080'},
    { name: "Feb", value: '#000080'},
    { name: "Mar", value: '#000080'},
    { name: "Abr", value: '#000080'},
    { name: "May", value: '#000080'},
    { name: "Jun", value: '#000080'},
    { name: "Jul", value: '#000080'},
    { name: "Ago", value: '#000080'},
    { name: "Sep", value: '#000080'},
    { name: "Oct", value: '#000080'},
    { name: "Nov", value: '#000080'},
    { name: "Dic", value: '#000080'}
  ];




}
