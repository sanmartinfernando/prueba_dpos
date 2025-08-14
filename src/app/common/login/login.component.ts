import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../../_models/user.model';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';
import { PagesService } from 'src/app/_services/pages.service';

/**
 * Componente de inicio de sesión que valida las credenciales del usuario,
 * gestiona el estado de autenticación y redirige a las páginas correspondientes.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private pagesService = inject(PagesService);
  public router = inject(Router);

  private userSubscription!: Subscription;

  loginForm;
  code = 'password-recovery';
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  token: [] = [];
  componentSelected: string;
  loading = false;

  /**
   * Inicializa el formulario de inicio de sesión y suscribe el estado del usuario.
   */
  ngOnInit(): void {
    this.userSubscription = this.storageService.userInfo.subscribe(user => {
      this.updateUserData(user);
    });
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.componentSelected = this.storageService.getComponent();
    }
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      pw: ['', [Validators.required]]
    });
  }

  /**
   * Envía el formulario de inicio de sesión y valida las credenciales.
   */
  public onSubmit(): void {
    this.loading = true;
    const { username, pw } = this.loginForm.value;
    this.isLoginFailed = false;
    this.authService.login(username, pw)
      .then(() => {
        this.isLoggedIn = true;
        this.storageService.updateloggin(true);
        this.loading = false;
        this.navigateLoggedIn();
      })
      .catch(() => {
        this.isLoginFailed = true;
        this.loading = false;
      });
  }

  /**
   * Redirige al usuario autenticado a la página correspondiente.
   */
  private navigateLoggedIn(): void {
    let page = '/dashboard';
    const params = {};
    this.route.queryParams.subscribe(routeParams => {
      if (routeParams['callbackUrl']) {
        page = routeParams['callbackUrl'];
      }
    });

    this.router.navigate([page], { queryParams: params });
  }

  /**
   * Actualiza el estado de sesión según la información del usuario.
   * @param user Datos del usuario.
   */
  private updateUserData(user: User): void {
    this.isLoggedIn = !!user;
  }
}
