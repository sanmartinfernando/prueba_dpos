import { Injectable } from '@angular/core';
import { Commerce } from '../_models/commerce.model';

/**
 * @class ThemeService
 * @description
 * Servicio encargado de gestionar la carga y activación de temas CSS
 * asociados a diferentes comercios.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {

  private themes = new Map<string, string>([
    [Commerce.RESELLER_DID, 'theme-did'],
    [Commerce.RESELLER_ABANCA, 'theme-did'],
    [Commerce.RESELLER_BBVA, 'theme-did'],
    [Commerce.RESELLER_IBERCAJA, 'theme-did'],
    [Commerce.RESELLER_COMERCIA, 'theme-comercia'],
    [Commerce.RESELLER_GETNET, 'theme-did'],
    [Commerce.RESELLER_CAJAMAR, 'theme-did'],
    [Commerce.RESELLER_CAJARURAL, 'theme-did'],
    [Commerce.RESELLER_KUTXABANK, 'theme-did'],
    [Commerce.RESELLER_LABORALKUTXA, 'theme-did'],
    [Commerce.RESELLER_OPENPAY, 'theme-did'],
    [Commerce.RESELLER_SABADELL, 'theme-did']
  ]);

  constructor() {
    this.preloadAllThemes();
  }

  /**
   * Precarga todos los temas en el DOM como enlaces <link> deshabilitados.
   * Esto permite activarlos posteriormente sin recargar la página.
   */
  private preloadAllThemes(): void {
    const head = document.head;
    this.themes.forEach((themeName, reseller) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
/*       link.href = `assets/themes/${themeName}.css`; */
     link.href = `assets/themes/${themeName}.css`;
      link.dataset['theme'] = reseller;
      link.disabled = true;
      head.appendChild(link);
    });
  }

  /**
   * Activa el tema correspondiente al comercio indicado y
   * desactiva el resto de temas cargados.
   * 
   * @param resellerName Nombre del comercio cuyo tema se desea activar.
   */
  public loadTheme(resellerName: string): void {
    document.querySelectorAll<HTMLLinkElement>('link[data-theme]')
      .forEach(link => link.disabled = link.dataset['theme'] !== resellerName);
  }
}
