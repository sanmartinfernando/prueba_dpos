import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dpos-base',
  templateUrl: './base.component.html',
  styleUrls: []
})
export class BaseComponent implements OnInit {

  public router = inject(Router);

  constructor() { }

  ngOnInit(): void {
  }

  onError(error?: string) {
    const page = "/error";
    const params = {};
    if (error !== null && error !== undefined) {
      params['msg'] = error;
    }
    this.router.navigate([page], { queryParams: params });
  }

  onLoginRequired(callbackUrl?: string) {
    const page = "/login";
    const params = {};
    if (callbackUrl !== null && callbackUrl !== undefined) {
      params['callbackUrl'] = callbackUrl;
    }
    this.router.navigate([page], { queryParams: params });
  }

  onUnauthorized(callbackUrl?: string) {
    const page = "/unauthorized";
    const params = {};
    if (callbackUrl !== null && callbackUrl !== undefined) {
      params['callbackUrl'] = callbackUrl;
    }
    this.router.navigate([page], { queryParams: params });
  }
}
