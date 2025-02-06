import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { PwdConditions } from 'src/app/_models/pwd-conditions.model';
import { PwdReset } from 'src/app/_models/pwd-reset.model';
import { PwresetService } from 'src/app/_services/pwreset.service';

@Component({
  selector: 'app-pwreset',
  templateUrl: './pwreset.component.html',
})
export class PwresetComponent {
  constructor(private router: Router, private PwresetService: PwresetService) {}


  conditions: PwdConditions;
  userLocal: string = '';
  userPassword: string = '';
  userConfirmPassword: string = '';
  parameters: any = {
    token: '',
    password: '',
    confirmPassword: '',
  };
  token;
  response: PwdReset;
  error = new Array;
  counter;

  resetPW() {
    this.error = [];
    this.counter = 0;
    if (this.userPassword != this.userConfirmPassword){
      this.error.push("La contraseña en ambos campos tiene que ser la misma")
    }
    this.token = this.router.url.split('=');
    this.parameters.token = this.token[1];
    this.parameters.userName = this.userLocal;
    this.parameters.password = this.userPassword;
    this.parameters.confirmPassword = this.userConfirmPassword;
    this.PwresetService.checkPwCond().subscribe(
      (condition) => {
        this.conditions = condition;
        console.log(this.conditions)
        this.PwresetService.PwResetMethod(this.parameters).subscribe(
          (response) => {
            this.response = response;
          },
           (error) => {
            if (error.error.Errors != null) {
              for (let i = 0; i < error.error.Errors.length; i++) {
                if( error.error.Errors[i]== "MinimalLengthNotReached"){
                  this.error.push("La contraseña debe tener al menos "+ this.conditions.requireMinLength +" caracteres")
                }
                if( error.error.Errors[i]== "UppercaseRequired"){
                  this.error.push("La contraseña debe tener al menos 1 mayúscula")
                }
                if( error.error.Errors[i]== "LowercaseRequired"){
                  this.error.push("La contraseña debe tener al menos 1 minúscula")
                }
                if( error.error.Errors[i]== "SymbolRequired"){
                  this.error.push("La contraseña debe tener al menos 1 símbolo")
                }
                if( error.error.Errors[i]== "NumberRequired"){
                  this.error.push("La contraseña debe tener al menos 1 número")
                }
                if( error.error.Errors[i]== "UsernameFoundInPassword"){
                  this.error.push("El nombre de usuario no puede formar parte de la contraseña")
                }
              }
              if (error.status == 401 || error.status == 500 ){
                this.counter = 1;
                this.error.push("Ha habido algún problema con el servicio, pruebe más tarde")
              }
            }
          }
        );


      }
    )

  }
}
