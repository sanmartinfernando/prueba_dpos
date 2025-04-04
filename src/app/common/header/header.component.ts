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
  commerceSelected: string;
  commerces: Commerce[];
  title: string= "DPOS";
  title0: string= "DPOS";

  constructor(private pagesService: PagesService,
    private _authService : AuthService,
    private portalUsersService: PortalUsersService,
    private commercesService: CommercesService,
    private storageService: StorageService,
    private sessionService: SessionService,
    public router: Router){
    this.pages = pagesService.pages;
    this.authService = _authService;
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
                if(this.sessionService.getItem(SessionService.COMMERCE_ID) == null){
                  this.commerceSelected = commerces[0].commerceNumber;
                  this.sessionService.setItem(SessionService.COMMERCE_ID, this.getCommerceId());
                } else {
                  this.commerceSelected = this.getCommerceNumber(this.sessionService.getItem(SessionService.COMMERCE_ID));
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
    this.commerceSelected = this.getCommerceNumber(this.getCommerceId());
    this.commercesService.setCommerceId(this.getCommerceId());
    this.sessionService.setItem(SessionService.COMMERCE_ID, this.getCommerceId());
    this.sessionService.setCommerceId(this.getCommerceId());
  }
  
  getCommerceId(): number {
    const commerce = this.commerces.find(commerce => commerce.commerceNumber == this.commerceSelected);
    if(commerce != undefined) {
      return commerce.commerceId;
    }
    return 0;
  }

  getCommerceNumber(commerceId:number): string {
    const commerce = this.commerces.find(commerce => commerce.commerceId == commerceId);
    if(commerce != undefined) {
      return commerce.commerceNumber;
    }
    return "";
  }
}
