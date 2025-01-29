import { Component, OnInit } from '@angular/core';
import { PagesService } from 'src/app/_services/pages.service';
import { Page } from 'src/app/_models/Page';
import { StorageService } from 'src/app/_services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';
import { Commerce } from 'src/app/_models/Commerce.model';
import { PortalUsersService } from 'src/app/_services/portal-users.service';
import { CommercesService } from '../../_services/commerces.service';

@Component({
  selector: 'DPOSW-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit {

    public pages : Page[] = [];
    username: string;
    private authService: AuthService;
    isLoggedIn: boolean = false;
    commerceSelected;
    commerces: Commerce[];

  constructor(private _pagesService: PagesService,
    private PortalUsersService: PortalUsersService,
    private CommercesService: CommercesService,
    private storageService: StorageService,
    public router: Router, 
    private route: ActivatedRoute, 
    private _authService : AuthService){

    this.pages=_pagesService.pages;
    this.authService = _authService;
  }
  ngOnInit(): void {


    this.storageService.userInfo.subscribe(user =>{
      console.log('this.storageService.userInfo.subscribe');
      console.log(user);
      if(user !== undefined && user != null){
        this.isLoggedIn = true;
        this.username = user.user;

        this.PortalUsersService.GetToken().subscribe(
          (portalUserToken)=> {
            this.authService.setPortalUsersToken(portalUserToken.token);
            this.CommercesService.GetCommerceList().subscribe(
              (commerces) => {
                this.commerces = commerces;
                this.commerceSelected = commerces[0].commerceNumber
                this.CommercesService.setCommerceId(this.getCommerceId());
              },
              (error) => {
                console.error("Error Commerces: ", error);
              }
            );
          },
          (error) => {
            console.error("Error Portal user token", error);
          }
        );



      }else{
        this.isLoggedIn = false;
      }

    });

    console.log(this.isLoggedIn)
  }

  title: string= "DPOS"
  title0: string= "DPOS"

  titleHeader(name){
      this.title=name;
      //this.storageService.updateloggin(this.isLoggedIn);
  }

  logOut(){
    this.storageService.clean();
    window.location.reload();
    this.storageService.updateloggin(this.isLoggedIn);
  }

  ngDoCheck() {
    //this.username = this.storageService.getUsername();
  }

  component(component:string){
    this.storageService.setComponent(component);
  }

  onCommerceChange(): void {
    this.CommercesService.setCommerceId(this.getCommerceId());
    console.log('Comercio seleccionado:', this.commerceSelected);
  }
  
  getCommerceId(): number {
    const commerce = this.commerces.find(commerce => commerce.commerceNumber = this.commerceSelected);
    if(commerce != undefined) {
      return commerce.commerceId;
    }
    return 0;
  }
}
