import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/_models/user.model';
import { StorageService } from 'src/app/_services/storage.service';
import { PortalUsersService } from 'src/app/_services/portal-users.service';
import { CountdownEvent } from 'ngx-countdown';


@Component({
  selector: 'app-pwrecovery',
  templateUrl: './pwrecovery.component.html',
})
export class PwrecoveryComponent implements OnInit {

  private userSuscription!: Subscription;
  disabled = false;
  isLoggedIn = false;
  componentSelected: string;
  userLocal: string = "";
  user: any = {
    userName: '',
  }
  text = "";
  text2 = "";
  text3 = "";

  constructor(private storageService: StorageService, private PortalUsersService: PortalUsersService) { }

  ngOnInit(): void {
    this.userSuscription = this.storageService.userInfo.subscribe(user => {
      this.updateUserData(user);
    });
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.componentSelected = this.storageService.getComponent();
    }
  }

  sendUSerPwRec() {
    this.text = "";
    this.text2 = "";
    this.text3 = "";
    this.user.userName = this.userLocal;
    this.PortalUsersService.recoverPwd(this.user);
    this.text = "Si el nombre de usuario es correcto se enviará un correo asociado a la cuenta.  "
    this.text2 = "Sino recibe ningún correo espere el tiempo mostrado antes de realizar una nueva petición.";
    this.text3 = "Acuérdese de revisar la carpeta de 'spam'.";
  }

  updateUserData(user: User) {
    if (user != null) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

  onTimerFinished(e: CountdownEvent) {
    if (e.action == 'start') {
      this.disabled = true;
    }
    if (e.action == 'done') {
      this.disabled = false;
    }
  }
}
