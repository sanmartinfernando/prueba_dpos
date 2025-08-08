import { Component, EventEmitter, HostListener, OnInit, Output, DoCheck, inject } from '@angular/core';
import { PagesService } from 'src/app/_services/pages.service';
import { Page } from 'src/app/_models/page.model';
import { StorageService } from 'src/app/_services/storage.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { Commerce } from 'src/app/_models/commerce.model';
import { PortalUsersService } from 'src/app/_services/portal-users.service';
import { CommercesService } from '../../_services/commerces.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from '../../_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';


@Component({
  selector: 'app-dpos-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit, DoCheck {

  private authService = inject(AuthService);
  private portalUsersService = inject(PortalUsersService);
  private commercesService = inject(CommercesService);
  private storageService = inject(StorageService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  public router = inject(Router);

  @Output() navToggled = new EventEmitter<boolean>();

  showNav = true;
  pages: Page[] = [];
  username: string;
  isLoggedIn = false;
  commerceSelected: number;
  commerces: Commerce[];
  title = "DPOS";
  title0 = "DPOS";
  isComercia = false;
  formSelectEnabled = true;
  logoLoaded = false;

  constructor(private pagesService: PagesService) {

    this.pages = pagesService.pages;

    this.uiStateService.formSelectEnabled$.subscribe(enabled => {
      this.formSelectEnabled = enabled;
    });

    // Detectar tamaño inicial
    this.showNav = this.isLargeScreen();
  }

  ngOnInit(): void {
    this.loadThemeByResellerName();
    this.storageService.userInfo.subscribe(user => {
      if (user !== undefined && user !== null) {
        this.isLoggedIn = true;
        this.username = user.user;
        this.portalUsersService.getToken(user).subscribe({
          next: (portalUserToken) => {
            this.authService.setPortalUsersToken(portalUserToken.token);
            this.commercesService.getCommerceList().subscribe({
              next: (commerces) => {
                this.commerces = commerces;
                this.commerceSelected = this.sessionService.getItem(SessionService.COMMERCE_ID);
                if (this.commerceSelected === null) {
                  this.commerceSelected = commerces[0].commerceId;
                  this.sessionService.setItem(SessionService.COMMERCE_ID, commerces[0].commerceId);
                  this.sessionService.setItem(SessionService.RESELLER_NAME, commerces[0].resellerName);
                  this.loadThemeByResellerName();
                }
              },
              error: (error) => {
                console.error("Error Commerces: ", error);
              }
            });
          },
          error: (error) => {
            console.error("Error Portal user token", error);
          }
        });
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  toggleNav() {
    this.showNav = !this.showNav;
    this.navToggled.emit(this.showNav);  // Emitir evento
  }

  //Método seguro para verificar tamaño de pantalla
  isLargeScreen(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  }

  handlePageClick(text: string, code: string): void {
    this.titleHeader(text);
    this.component(code);
    this.showNav = this.isLargeScreen();
    this.navToggled.emit(this.showNav);  // Emitir también aquí porque cambia showNav
  }

  @HostListener('window:resize')
  onResize() {
    this.showNav = this.isLargeScreen();
    this.navToggled.emit(this.showNav);  // Emitir también al cambiar tamaño
  }

  getTitle() {
    if (this.isComercia) {
      this.title = "TPV&GO";
    } else {
      this.title = "DPOS";
    }
  }

  titleHeader(name: string) {
    this.title = name;
  }

  logOut() {
    this.storageService.clean();
    window.location.reload();
    this.storageService.updateloggin(this.isLoggedIn);
  }

  ngDoCheck() {

  }

  component(component: string) {
    this.storageService.setComponent(component);
  }

  onCommerceChange(): void {
    const commerce: Commerce = this.getCommerce();
    this.commerceSelected = commerce.commerceId;
    this.commercesService.setCommerceId(commerce.commerceId);
    this.sessionService.setItem(SessionService.COMMERCE_ID, commerce.commerceId);
    this.sessionService.setItem(SessionService.RESELLER_NAME, commerce.resellerName);
    this.sessionService.setCommerceId(commerce.commerceId);
    this.loadThemeByResellerName();
  }

  getCommerce(): Commerce {
    const commerce = this.commerces.find(commerce => commerce.commerceId === this.commerceSelected);
    if (commerce !== undefined) {
      return commerce;
    }
    return null;
  }

  private loadThemeByResellerName(): void {
    this.logoLoaded = false;
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.isComercia = this.isComerciaTheme();
    this.getTitle();
    this.logoLoaded = true;
  }

  private isComerciaTheme(): boolean {
    return this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
  }
}
