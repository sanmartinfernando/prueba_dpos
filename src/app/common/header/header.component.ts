import { Component, EventEmitter, HostListener, OnInit, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Commerce } from 'src/app/_models/commerce.model';
import { Page } from 'src/app/_models/page.model';
import { PagesService } from 'src/app/_services/pages.service';
import { SessionService } from 'src/app/_services/session.service';
import { StorageService } from 'src/app/_services/storage.service';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { CommercesService } from '../../_services/commerces.service';
import { ThemeService } from '../../_services/theme.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * @class HeaderComponent
 * @description
 * Componente de cabecera del portal Web que gestiona la navegación,
 * la sesión de usuario, el comercio seleccionado y el tema visual.
 */
@Component({
  selector: 'app-dpos-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit {

  private commercesService = inject(CommercesService);
  private storageService = inject(StorageService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);
  private uiStateService = inject(UIStateService);
  private pagesService = inject(PagesService);
  public router = inject(Router);

  @Output() navToggled = new EventEmitter<boolean>();

  showNav = true;
  pages: Page[] = [];
  username: string;
  isLoggedIn = false;
  commerceSelected: number;
  commerces: Commerce[];
  title = 'DPOS';
  title0 = 'DPOS';
  isComercia = false;
  formSelectEnabled = true;
  iconsLoaded = false;

  constructor() {
    this.pages = this.pagesService.pages;
    this.uiStateService.formSelectEnabled$.subscribe(enabled => {
      this.formSelectEnabled = enabled;
    });
    this.showNav = this.isLargeScreen();
  }

  /**
   * Inicializa el componente cargando el tema y validando el usuario.
   */
  ngOnInit(): void {
    this.loadThemeByResellerName();

    this.storageService.userInfo.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.username = user.user;
        this.commercesService.getCommerceList().subscribe({
          next: commerces => {
            this.commerces = commerces;
            this.commerceSelected = this.sessionService.getItem(SessionService.COMMERCE_ID);
            if (this.commerceSelected === null) {
              const firstCommerce = commerces[0];
              this.commerceSelected = firstCommerce.commerceId;
              this.sessionService.setItem(SessionService.COMMERCE_ID, firstCommerce.commerceId);
              this.sessionService.setItem(SessionService.RESELLER_NAME, firstCommerce.resellerName);
              this.loadThemeByResellerName();
            }
          },
          error: () => {
            //TODO
          }
        });
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  /**
   * Ajusta el menú al redimensionar la ventana.
   */
  @HostListener('window:resize')
  onResize(): void {
    this.showNav = this.isLargeScreen();
    this.navToggled.emit(this.showNav);
  }

  /**
   * Alterna la visibilidad del menú de navegación.
   */
  public toggleNav(): void {
    this.showNav = !this.showNav;
    this.navToggled.emit(this.showNav);
  }

  /**
   * Gestiona el clic de las opciones del menú de navegación.
   * 
   * @param labelKey Texto de la opción de menú seleccionada.
   * @param code Código de la opción seleccionada.
   */
  public handlePageClick(labelKey: string, code: string): void {
    const label = this.translate.instant(labelKey);
    this.titleHeader(label);
    this.component(code);
    this.showNav = this.isLargeScreen();
    this.navToggled.emit(this.showNav);
  }

  /**
   * Actualiza el título en función del tema activo.
   */
  public getTitle(): void {
    this.title = this.isComercia ? 'TPV&GO' : 'DPOS';
  }

  /**
   * Cierra sesión del usuario y recarga la página.
   */
  public logOut(): void {
    this.storageService.clean();
    window.location.reload();
    this.storageService.updateloggin(this.isLoggedIn);
  }

  /**
   * Cambia el comercio seleccionado y recarga el tema.
   */
  public onCommerceChange(): void {
    const commerce = this.getCommerce();
    if (commerce) {
      this.commerceSelected = commerce.commerceId;
      this.commercesService.setCommerceId(commerce.commerceId);
      this.sessionService.setItem(SessionService.COMMERCE_ID, commerce.commerceId);
      this.sessionService.setItem(SessionService.RESELLER_NAME, commerce.resellerName);
      this.sessionService.setCommerceId(commerce.commerceId);
      this.loadThemeByResellerName();
    }
  }

  /**
   * Verifica si la pantalla es de tamaño grande.
   * 
   * @returns True si el ancho de la ventana es mayor o igual a 768px.
   */
  private isLargeScreen(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  }

  /**
   * Cambia el título principal de la cabecera.
   * 
   * @param name Nuevo título.
   */
  private titleHeader(name: string): void {
    this.title = name;
  }
  
  /**
   * Guarda el componente seleccionado en almacenamiento.
   * 
   * @param component Nombre del componente.
   */
  private component(component: string): void {
    this.storageService.setComponent(component);
  }
  
  /**
   * Obtiene el comercio actualmente seleccionado.
   * 
   * @returns Comercio, o null si no existe.
   */
  private getCommerce(): Commerce {
    return this.commerces.find(c => c.commerceId == this.commerceSelected) ?? null;
  }

  /**
   * Carga el tema correspondiente al comercio guardado.
   */
  private loadThemeByResellerName(): void {
    this.iconsLoaded = false;
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.isComercia = this.isComerciaTheme();
    this.getTitle();
    this.iconsLoaded = true;
  }

  /**
   * Determina si el tema actual corresponde a la entidad de 'Comercia'.
   * 
   * @returns True si el comercio es Comercia.
   */
  private isComerciaTheme(): boolean {
    return this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
  }
}
