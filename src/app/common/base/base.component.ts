import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'DPOSW-base',
  templateUrl: './base.component.html',
  styleUrls: []
})
export class BaseComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

  onError(error?: string) {
    var page = "/error";
    var params = {};
    if (error != null && error != undefined) {
      params['msg'] = error;
    }
    this.router.navigate([page], { queryParams: params });
  }

  onLoginRequired(callbackUrl?: string) {
    var page = "/login";
    var params = {};
    if (callbackUrl != null && callbackUrl != undefined) {
      params['callbackUrl'] = callbackUrl;
    }
    this.router.navigate([page], { queryParams: params });
  }

  onUnauthorized(callbackUrl?: string) {
    var page = "/unauthorized";
    var params = {};
    if (callbackUrl != null && callbackUrl != undefined) {
      params['callbackUrl'] = callbackUrl;
    }
    this.router.navigate([page], { queryParams: params });
  }
}
