import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Page } from 'src/app/_models/page.model';

/**
 * @class PagesService
 * @description
 * Servicio para gestionar las páginas de la aplicación Web y sus traducciones dinámicas
 * según el idioma seleccionado.
 */
@Injectable({ providedIn: 'root' })
export class PagesService {
  
  public translate = inject(TranslateService);

  public pages: Page[] = [
    new Page('0', 'Dashboard', 'dashboard', 'fa-solid fa-square-poll-vertical'),
    new Page('1', 'Ventas', 'sales', 'fa-solid fa-chart-line'),
    new Page('1', 'Cierres', 'balances', 'fa-regular fa-chart-bar'),
    new Page('1', 'Informes', 'reports', 'fa-solid fa-chart-area'),
    new Page('1', 'Clientes', 'customers', 'fa-solid fa-users'),
    new Page('1', 'Productos', 'products', 'fa-solid fa-boxes-stacked')
    //new Page('1','Impuestos','taxes','fa-solid fa-coins')
  ];

  /**
   * Inicializa el servicio y configura la actualización de textos
   * de las páginas al cambiar el idioma.
   */
  constructor() {
    this.translate.onLangChange.subscribe(() => {
      this.pages[0].text = this.translate.instant('dpos.dashboard.page.title');
      this.pages[1].text = this.translate.instant('dpos.sales.page.title');
      this.pages[2].text = this.translate.instant('dpos.balances.page.title');
      this.pages[3].text = this.translate.instant('dpos.reports.page.title');
      this.pages[4].text = this.translate.instant('dpos.customer.page.title');
      this.pages[5].text = this.translate.instant('dpos.products.page.title');
      //this.pages[6].text = this.translate.instant('dpos.taxes.page.title');
    });
  }
}
