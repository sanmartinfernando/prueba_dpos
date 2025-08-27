import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PwdProperties } from 'src/app/_models/pwd-properties.model';
import { PwdReset } from 'src/app/_models/pwd-reset.model';
import { PortalUsersService } from 'src/app/_services/portal-users.service';

/**
 * @class PwresetComponent
 * @description
 * Componente para restablecer la contraseña de un usuario,
 * validando las propiedades requeridas y mostrando mensajes de error.
 */
@Component({
  selector: 'app-pwreset',
  templateUrl: './pwreset.component.html'
})
export class PwresetComponent {
  
  private router = inject(Router);
  private portalUsersService = inject(PortalUsersService);

  properties: PwdProperties;
  parameters = { token: '', userName: '', password: '', confirmPassword: '' };
  tokenParts: string[];
  response: PwdReset;
  errorMessages: string[] = [];
  userLocal = '';
  userPassword = '';
  userConfirmPassword = '';
  errorCounter = 0;
  responseError = true;

  /**
   * Valida y envía la solicitud de restablecimiento de contraseña.
   */
  public resetPW(): void {
    this.errorMessages = [];
    this.errorCounter = 0;
    this.responseError = true;

    if (this.userPassword !== this.userConfirmPassword) {
      this.errorMessages.push('La contraseña en ambos campos tiene que ser la misma');
      return;
    }

    this.tokenParts = this.router.url.split('=');
    this.parameters.token = this.tokenParts[1];
    this.parameters.userName = this.userLocal;
    this.parameters.password = this.userPassword;
    this.parameters.confirmPassword = this.userConfirmPassword;

    this.portalUsersService.checkPwdProperties().subscribe(properties => {
      this.properties = properties;
      this.portalUsersService.resetPwd(this.parameters).subscribe({
        next: response => {
          this.responseError = false;
          this.response = response;
        },
        error: error => {
          this.responseError = true;
          if (error?.error?.Errors) {
            for (const err of error.error.Errors) {
              switch (err) {
                case 'MinimalLengthNotReached':
                  this.errorMessages.push(`La contraseña debe tener al menos ${this.properties.requireMinLength} caracteres`);
                  break;
                case 'UppercaseRequired':
                  this.errorMessages.push('La contraseña debe tener al menos 1 mayúscula');
                  break;
                case 'LowercaseRequired':
                  this.errorMessages.push('La contraseña debe tener al menos 1 minúscula');
                  break;
                case 'SymbolRequired':
                  this.errorMessages.push('La contraseña debe tener al menos 1 símbolo');
                  break;
                case 'NumberRequired':
                  this.errorMessages.push('La contraseña debe tener al menos 1 número');
                  break;
                case 'UsernameFoundInPassword':
                  this.errorMessages.push('El nombre de usuario no puede formar parte de la contraseña');
                  break;
              }
            }
          }
          if (error.status === 401 || error.status === 500) {
            this.errorCounter = 1;
            this.errorMessages.push('Ha habido algún problema con el servicio, pruebe más tarde');
          }
        }
      });
    });
  }
}
