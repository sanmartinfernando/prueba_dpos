import { Component } from '@angular/core';
import { LanguageManagerService } from 'src/app/_services/languagemanager.service';
import { PagesService } from 'src/app/_services/pages.service';
import { Page } from 'src/app/_models/Page';
import { StorageService } from 'src/app/_services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'QSC-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

    public pages : Page[] = [];
    username: string;

  constructor(private _pagesService: PagesService,private _translationService: LanguageManagerService,
    private storageService: StorageService,public router: Router, private route: ActivatedRoute){

    this.pages=_pagesService.pages;
    this.username = this.storageService.getUsername();
    
  }

  logOut(){
    this.storageService.clean();
    window.location.reload();
  }

  ngDoCheck() {
    this.username = this.storageService.getUsername();
  }

  component(component:string){
    this.storageService.setComponent(component);
  }

}
