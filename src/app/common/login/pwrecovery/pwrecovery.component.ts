import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/_models/user.model';
import { PwRecoverService } from 'src/app/_services/pwrecover.service';
import { StorageService } from 'src/app/_services/storage.service';

@Component({
  selector: 'app-pwrecovery',
  templateUrl: './pwrecovery.component.html',
})
export class PwrecoveryComponent implements OnInit {

  private userSuscription!: Subscription;
  isLoggedIn = false;
  componentSelected: string;
  userLocal: string="";
  user: any = {
    userName:'',
  }
  text="";

  constructor(private storageService: StorageService, private pwRecoverService: PwRecoverService) { }

  ngOnInit(): void {
    this.userSuscription = this.storageService.userInfo.subscribe(user => {
      this.updateUserData(user);
    });
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.componentSelected = this.storageService.getComponent();
    }

  }

  sendUSerPwRec(){
    this.text = ""
    this.user.userName=this.userLocal;
    this.pwRecoverService.PwRecovermethod(this.user);
    this.text = "Compruebe el correo asociado a la cuenta"
  }

  updateUserData(user: User) {
    if (user != null) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

}
