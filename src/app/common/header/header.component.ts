import { Component, OnInit } from '@angular/core';
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
  selector: 'DPOSW-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit {

  pages : Page[] = [];
  username: string;
  authService: AuthService;
  isLoggedIn: boolean = false;
  commerceSelected: number;
  commerces: Commerce[];
  title: string= "DPOS";
  title0: string= "DPOS";
  isComercia:boolean = false;
  formSelectEnabled = true;

  constructor(private pagesService: PagesService,
    private _authService : AuthService,
    private portalUsersService: PortalUsersService,
    private commercesService: CommercesService,
    private storageService: StorageService,
    private sessionService: SessionService,
    private themeService: ThemeService,
    private uiStateService: UIStateService,
    public router: Router){

    this.pages = pagesService.pages;
    this.authService = _authService;

    this.uiStateService.formSelectEnabled$.subscribe(enabled => {
      this.formSelectEnabled = enabled;
    });

  }

  ngOnInit(): void {
    this.storageService.userInfo.subscribe(user =>{
      if(user !== undefined && user != null){
        this.isLoggedIn = true;
        this.username = user.user;
        this.portalUsersService.getToken(user).subscribe({
          next: (portalUserToken)=> {
            this.authService.setPortalUsersToken(portalUserToken.token);
            this.commercesService.getCommerceList().subscribe({
              next: (commerces) => {
                this.commerces = commerces;
                this.commerceSelected = this.sessionService.getItem(SessionService.COMMERCE_ID);
                if(this.commerceSelected === null){
                  this.commerceSelected = commerces[0].commerceId;
                  this.sessionService.setItem(SessionService.COMMERCE_ID, this.getCommerceId());
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
      }else{
        this.isLoggedIn = false;
      }
    });
  }
  
  getTitle() {
    if(this.isComercia) {
      this.title = "TPV&GO";
    } else {
      this.title = "DPOS";
    }
  }

  titleHeader(name: string){
      this.title=name;
  }

  logOut(){
    this.storageService.clean();
    window.location.reload();
    this.storageService.updateloggin(this.isLoggedIn);
  }

  ngDoCheck() {

  }

  component(component:string){
    this.storageService.setComponent(component);
  }

  onCommerceChange(): void {

    let commerceId: number = this.getCommerceId();

    this.commerceSelected = commerceId;
    this.commercesService.setCommerceId(commerceId);
    this.sessionService.setItem(SessionService.COMMERCE_ID, commerceId);
    this.sessionService.setCommerceId(commerceId);

    this.loadThemeByResellerName();
  }
  
  getCommerceId(): number {
    const commerce = this.commerces.find(commerce => commerce.commerceId == this.commerceSelected);
    if(commerce != undefined) {
      return commerce.commerceId;
    }
    return 0;
  }

  getCommerceResellerName(): string {
    const commerce = this.commerces.find(commerce => commerce.commerceId == this.commerceSelected);
    if(commerce != undefined) {
      return commerce.resellerName;
    }
    return null;
  }

  private loadThemeByResellerName():void {
    this.themeService.loadTheme(this.getCommerceResellerName());
    this.isComercia = this.isComerciaTheme();
    this.getTitle();
  }

  private isComerciaTheme():boolean {
    return this.getCommerceResellerName() == Commerce.RESELLER_COMERCIA;
  }
}
