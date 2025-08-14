import { Component, OnInit, inject } from '@angular/core';
import { CountdownEvent } from 'ngx-countdown';
import { Subscription } from 'rxjs';
import { User } from 'src/app/_models/user.model';
import { PortalUsersService } from 'src/app/_services/portal-users.service';
import { StorageService } from 'src/app/_services/storage.service';

/**
 * Componente para la recuperación de contraseña de usuario.
 * Permite solicitar un restablecimiento de contraseña y gestiona
 * el estado de sesión y temporizadores de espera.
 */
@Component({
  selector: 'app-pwrecovery',
  templateUrl: './pwrecovery.component.html'
})
export class PwrecoveryComponent implements OnInit {
  private storageService = inject(StorageService);
  private portalUsersService = inject(PortalUsersService);

  private userSubscription!: Subscription;

  disabled = false;
  isLoggedIn = false;
  componentSelected: string;
  userLocal = '';
  user: { userName: string } = { userName: '' };
  text = '';
  text2 = '';
  text3 = '';

  /**
   * Inicializa el componente, suscribiéndose a los datos del usuario
   * y verificando el estado de sesión.
   */
  ngOnInit(): void {
    this.userSubscription = this.storageService.userInfo.subscribe(user => {
      this.updateUserData(user);
    });
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.componentSelected = this.storageService.getComponent();
    }
  }

  /**
   * Envía una solicitud de recuperación de contraseña para el usuario ingresado.
   */
  public sendUserPwRec(): void {
    this.text = '';
    this.text2 = '';
    this.text3 = '';
    this.user.userName = this.userLocal;
    this.portalUsersService.recoverPwd(this.user);
    this.text = 'Si el nombre de usuario es correcto se enviará un correo asociado a la cuenta.';
    this.text2 = 'Si no recibe ningún correo, espere el tiempo mostrado antes de realizar una nueva petición.';
    this.text3 = 'Revise también la carpeta de spam.';
  }

  /**
   * Gestiona los eventos del temporizador de espera.
   * @param e Evento del temporizador.
   */
  public onTimerFinished(e: CountdownEvent): void {
    if (e.action === 'start') {
      this.disabled = true;
    }
    if (e.action === 'done') {
      this.disabled = false;
    }
  }

  /**
   * Actualiza la información del usuario y su estado de sesión.
   * @param user Datos del usuario.
   */
  private updateUserData(user: User): void {
    this.isLoggedIn = !!user;
  }
}
