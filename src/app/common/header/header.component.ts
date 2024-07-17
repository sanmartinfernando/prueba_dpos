import { Component, OnInit } from '@angular/core';
import { LanguageManagerService } from 'src/app/_services/languagemanager.service';
import { PagesService } from 'src/app/_services/pages.service';
import { Page } from 'src/app/_models/Page';
import { StorageService } from 'src/app/_services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'DPOSW-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    public pages : Page[] = [];
    username: string;
    private authService: AuthService;
  constructor(private _pagesService: PagesService,private _translationService: LanguageManagerService,
    private storageService: StorageService,public router: Router, private route: ActivatedRoute, private _authService : AuthService){

    this.pages=_pagesService.pages;
    this.username = this.storageService.getUsername();
    this.authService = _authService;
  }
  ngOnInit(): void {
    
    this.authService.configObservable.subscribe(user => {
      console.log(user);
      this.username = user.user;
    });

  }

  title: string= "DPOS"
  title0: string= "DPOS"

  titleHeader(name){
      this.title=name;
  }

  logOut(){
    this.storageService.clean();
    window.location.reload();
  }

  ngDoCheck() {
    //this.username = this.storageService.getUsername();
  }

  component(component:string){
    this.storageService.setComponent(component);
  }

}
