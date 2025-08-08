import { Injectable, NgZone } from '@angular/core';
import { Commerce } from '../_models/commerce.model';


@Injectable({ providedIn: 'root' })
export class ThemeService {

  private static readonly THEME_DID: string = 'theme-did';
  private static readonly THEME_ABANCA: string = 'theme-abanca';
  private static readonly THEME_BBVA: string = 'theme-bbva';
  private static readonly THEME_IBERCAJA: string = 'theme-ibercaja';
  private static readonly THEME_COMERCIA: string = 'theme-comercia';
  private static readonly THEME_GETNET: string = 'theme-getnet';
  private static readonly THEME_CAJAMAR: string = 'theme-cajamar';
  private static readonly THEME_CAJARURAL: string = 'theme-cajarural';
  private static readonly THEME_KUTXABANK: string = 'theme-kutxabank';
  private static readonly THEME_LABORALKUTXA: string = 'theme-laboralkutxa';
  private static readonly THEME_OPENPAY: string = 'theme-openpay';
  private static readonly THEME_SABADELL: string = 'theme-sabadell';

  private themeLinkId = 'app-theme';

  public loadTheme(resellerName: string): void {
    const head = document.getElementsByTagName('head')[0];
    let themeLink = document.getElementById(this.themeLinkId) as HTMLLinkElement;
    let themeName = this.getThemeName(resellerName);
    if (themeLink) {
      themeLink.href = `assets/themes/${themeName}.css`;
    } else {
      const link = document.createElement('link');
      link.id = this.themeLinkId;
      link.rel = 'stylesheet';
      link.href = `assets/themes/${themeName}.css`;
      head.appendChild(link);
    }
  }

  private getThemeName(resellerName: string): string {
    if (!resellerName) {
      return ThemeService.THEME_DID;
    }

    let themeName = ThemeService.THEME_DID;

    switch (resellerName) {
      case Commerce.RESELLER_DID:
        themeName = ThemeService.THEME_DID;
        break;
      case Commerce.RESELLER_ABANCA:
        themeName = ThemeService.THEME_ABANCA;
        break;
      case Commerce.RESELLER_BBVA:
        themeName = ThemeService.THEME_BBVA;
        break;
      case Commerce.RESELLER_IBERCAJA:
        themeName = ThemeService.THEME_IBERCAJA;
        break;
      case Commerce.RESELLER_COMERCIA:
        themeName = ThemeService.THEME_COMERCIA;
        break;
      case Commerce.RESELLER_GETNET:
        themeName = ThemeService.THEME_GETNET;
        break;
      case Commerce.RESELLER_CAJAMAR:
        themeName = ThemeService.THEME_CAJAMAR;
        break;
      case Commerce.RESELLER_CAJARURAL:
        themeName = ThemeService.THEME_CAJARURAL;
        break;
      case Commerce.RESELLER_KUTXABANK:
        themeName = ThemeService.THEME_KUTXABANK;
        break;
      case Commerce.RESELLER_LABORALKUTXA:
        themeName = ThemeService.THEME_LABORALKUTXA;
        break;
      case Commerce.RESELLER_OPENPAY:
        themeName = ThemeService.THEME_OPENPAY;
        break;
      case Commerce.RESELLER_SABADELL:
        themeName = ThemeService.THEME_SABADELL;
        break;
    }

    return themeName;
  }
}