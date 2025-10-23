import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { InactivityService } from './_services/inactivity.service';
import { StorageService } from './_services/storage.service';
import { CommercesService } from './_services/commerces.service';
import { SessionService } from './_services/session.service';
import { ThemeService } from './_services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { UIStateService } from './_services/ui-state.service';
import { PagesService } from './_services/pages.service';
import { Commerce } from './_models/commerce.model';

/**
 * @class AppComponent
 * @description
 * Componente raíz de la aplicación.
 * Gestiona el estado de navegación y el monitoreo de inactividad del usuario.
 */
@Component({
  selector: 'app-dpos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private inactivityService = inject(InactivityService);
  private commercesService = inject(CommercesService);
  private storageService = inject(StorageService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);
  private uiStateService = inject(UIStateService);
  private pagesService = inject(PagesService);
  public appLoaded = false;
  public navIsOpen = true;
  isIframe = window.self !== window.top;
  isLoggedIn = false;
  username: string;
  commerces: Commerce[];
  commerceSelected: number;
  iconsLoaded = false;
  isComercia = false;
  title = 'DPOS';
  /**
   * Inicializa el componente y comienza el monitoreo de inactividad.
   */
  ngOnInit(): void {
    this.inactivityService.startMonitoring();
    console.log('AppComponent is running inside an iframe:', this.isIframe);
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
    }


    this.storageService.userInfo.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.username = user.user;
        this.commercesService.getCommerceList().subscribe({
          next: commerces => {
            this.commerces = commerces;
            this.commerceSelected = this.sessionService.getItem(SessionService.COMMERCE_ID);

            let finalResellerName: string;

            if (this.commerceSelected === null) {
              const firstCommerce = commerces[0];
              this.commerceSelected = firstCommerce.commerceId;
              this.sessionService.setItem(SessionService.COMMERCE_ID, firstCommerce.commerceId);
              this.sessionService.setItem(SessionService.RESELLER_NAME, firstCommerce.resellerName);
              finalResellerName = firstCommerce.resellerName;
            } else {

              finalResellerName = this.sessionService.getItem(SessionService.RESELLER_NAME);
            }


            this.loadThemeByResellerName(finalResellerName);
            this.appLoaded = true;
          },
          error: () => {
            this.appLoaded = true;
          }
        });
      } else {
        this.isLoggedIn = false;
        this.appLoaded = true;
      }
    });
  }

  /**
   * Detiene el monitoreo de inactividad antes de destruir el componente.
   */
  ngOnDestroy(): void {
    this.inactivityService.stopMonitoring();
  }

  /**
   * Actualiza el estado del menú de navegación.
   * 
   * @param isOpen Indica si el menú debe mostrarse abierto.
   */
  public onNavToggled(isOpen: boolean): void {
    this.navIsOpen = isOpen;
  }

  private loadThemeByResellerName(finalResellerName: string): void {
    this.iconsLoaded = false;
    this.themeService.loadTheme(finalResellerName);
    this.isComercia = this.isComerciaTheme();
    this.getTitle();
    this.iconsLoaded = true;
  }
  private isComerciaTheme(): boolean {
    return this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
  }
  public getTitle(): void {
    this.title = this.isComercia ? 'TPV&GO' : 'DPOS';
  }
}
