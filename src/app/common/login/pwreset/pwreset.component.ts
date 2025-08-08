import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PwdProperties } from 'src/app/_models/pwd-properties.model';
import { PwdReset } from 'src/app/_models/pwd-reset.model';
import { PortalUsersService } from 'src/app/_services/portal-users.service';


@Component({
  selector: 'app-pwreset',
  templateUrl: './pwreset.component.html',
})
export class PwresetComponent {

  private router = inject(Router);
  private portalUsersService = inject(PortalUsersService);

  properties: PwdProperties;
  userLocal = '';
  userPassword = '';
  userConfirmPassword = '';
  parameters: any = {
    token: '',
    password: '',
    confirmPassword: '',
  };
  token: string[];
  response: PwdReset;
  error = [];
  counter: number;

  constructor() { }

  resetPW() {
    this.error = [];
    this.counter = 0;
    if (this.userPassword !== this.userConfirmPassword) {
      this.error.push("La contraseña en ambos campos tiene que ser la misma")
    }
    this.token = this.router.url.split('=');
    this.parameters.token = this.token[1];
    this.parameters.userName = this.userLocal;
    this.parameters.password = this.userPassword;
    this.parameters.confirmPassword = this.userConfirmPassword;
    this.portalUsersService.checkPwdProperties().subscribe((properties) => {
      this.properties = properties;
      this.portalUsersService.resetPwd(this.parameters).subscribe({
        next: (response) => {
          this.response = response;
        },
        error: (error) => {
          if (error.error.Errors !== null) {
            for (let i = 0; i < error.error.Errors.length; i++) {
              if (error.error.Errors[i] === "MinimalLengthNotReached") {
                this.error.push("La contraseña debe tener al menos " + this.properties.requireMinLength + " caracteres")
              }
              if (error.error.Errors[i] === "UppercaseRequired") {
                this.error.push("La contraseña debe tener al menos 1 mayúscula")
              }
              if (error.error.Errors[i] === "LowercaseRequired") {
                this.error.push("La contraseña debe tener al menos 1 minúscula")
              }
              if (error.error.Errors[i] === "SymbolRequired") {
                this.error.push("La contraseña debe tener al menos 1 símbolo")
              }
              if (error.error.Errors[i] === "NumberRequired") {
                this.error.push("La contraseña debe tener al menos 1 número")
              }
              if (error.error.Errors[i] === "UsernameFoundInPassword") {
                this.error.push("El nombre de usuario no puede formar parte de la contraseña")
              }
            }
            if (error.status === 401 || error.status === 500) {
              this.counter = 1;
              this.error.push("Ha habido algún problema con el servicio, pruebe más tarde")
            }
          }
        }
      });
    });
  }
}
