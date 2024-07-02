import { Component, OnInit } from '@angular/core';
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

  private userSuscription!: Subscription;
  loginForm;

  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  token: any = [];
  componentSelected: string;

  constructor(private authService: AuthService, private storageService: StorageService,
    private formBuilder: FormBuilder, public router: Router, private route: ActivatedRoute, private _pagesService: PagesService) { }

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
    console.log(this.loginForm.value);
    const { username, pw } = this.loginForm.value;
    this.isLoginFailed = false;

    this.authService.login(username, pw)
      .then((result) => {
        //this.storageService.saveUser(email);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.navigateLoggedIn();
        return;
        // if (this.componentSelected) {
        //   this.router.navigate(['/' + this.componentSelected]);
        // } else {
        //   this.router.navigate(['/']);
        // }
      }).catch((err) => {
        //console.log(err);
        this.isLoginFailed = true;
      });
  }

  navigateLoggedIn() {
    var params = {};
    var page = "/home"
    this.route.queryParams.subscribe(routeParams => {
      if (routeParams['callbackUrl']) {
        page = routeParams['callbackUrl'];
      }
    });
    this.router.navigate([page], { queryParams: params });
  }
  navigateError() {
    var params = {};
    var page = "/error"
    this.router.navigate([page], { queryParams: params });
  }
  reloadPage(): void {
    this.navigateLoggedIn();
  }
  updateUserData(user: User) {
    if (user != null) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

}
