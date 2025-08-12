import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesService } from 'src/app/_services/pages.service';
import { Subscription } from 'rxjs';
import { User } from '../../_models/user.model';
import { FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private formBuilder = inject(FormBuilder);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private _pagesService = inject(PagesService);

  private userSuscription!: Subscription;
  loginForm;
  code = "password-recovery";
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  token: [] = [];
  componentSelected: string;
  loading = false;

  ngOnInit(): void {
    this.userSuscription = this.storageService.userInfo.subscribe(user => {
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

  onSubmit(): void {
    this.loading = true;
    const { username, pw } = this.loginForm.value;
    this.isLoginFailed = false;

    this.authService.login(username, pw)
      .then(() => {
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.storageService.updateloggin(this.isLoggedIn)
        this.loading = false;
        this.navigateLoggedIn();
        return;
      }).catch(() => {
        this.isLoginFailed = true;
        this.loading = false;
      });
  }

  navigateLoggedIn() {
    const params = {};
    let page = "/dashboard" //"home"
    this.route.queryParams.subscribe(routeParams => {
      if (routeParams['callbackUrl']) {
        page = routeParams['callbackUrl'];
      }
    });
    this.router.navigate([page], { queryParams: params });
  }

  navigateError() {
    const params = {};
    const page = "/error"
    this.router.navigate([page], { queryParams: params });
  }

  reloadPage(): void {
    this.navigateLoggedIn();
  }

  updateUserData(user: User) {
    if (user !== null) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }
}
