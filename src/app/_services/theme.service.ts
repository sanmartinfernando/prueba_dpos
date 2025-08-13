import { Injectable } from '@angular/core';
import { Commerce } from '../_models/commerce.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themes = new Map<string, string>([
    [Commerce.RESELLER_DID, 'theme-did'],
    [Commerce.RESELLER_ABANCA, 'theme-abanca'],
    [Commerce.RESELLER_BBVA, 'theme-bbva'],
    [Commerce.RESELLER_IBERCAJA, 'theme-ibercaja'],
    [Commerce.RESELLER_COMERCIA, 'theme-comercia'],
    [Commerce.RESELLER_GETNET, 'theme-getnet'],
    [Commerce.RESELLER_CAJAMAR, 'theme-cajamar'],
    [Commerce.RESELLER_CAJARURAL, 'theme-cajarural'],
    [Commerce.RESELLER_KUTXABANK, 'theme-kutxabank'],
    [Commerce.RESELLER_LABORALKUTXA, 'theme-laboralkutxa'],
    [Commerce.RESELLER_OPENPAY, 'theme-openpay'],
    [Commerce.RESELLER_SABADELL, 'theme-sabadell']
  ]);

  constructor() {
    this.preloadAllThemes();
  }

  private preloadAllThemes(): void {
    const head = document.head;

    this.themes.forEach((themeName, reseller) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `assets/themes/${themeName}.css`;
      link.dataset['theme'] = reseller;
      link.disabled = true; // Todos deshabilitados al inicio
      head.appendChild(link);
    });
  }

  public loadTheme(resellerName: string): void {
    const allLinks = document.querySelectorAll<HTMLLinkElement>('link[data-theme]');
    allLinks.forEach(link => {
      link.disabled = link.dataset['theme'] !== resellerName;
    });
  }
}