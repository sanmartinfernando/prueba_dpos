import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpHeaders,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, endWith, from, tap, throwError } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { User } from '../_models/user.model';
import { RestRoutes } from '../_config/rest-routes.config';
import { SecurityConstants } from '../_config/security-constants.config';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private user: User;
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.endsWith(RestRoutes.AUTH)) {
      return next.handle(req);
    }
    let authReq = req;
    if (req.url.includes('wsenrollment')) {
      const token = this.authService.getToken2();
      if (token != null) {
        authReq = req.clone({
          headers: req.headers.set(
            SecurityConstants.TOKEN_HEADER_KEY,
            `${SecurityConstants.TOKEN_PREFIX} ${token}`
          ),
        });
      }
    } else {
      const token = this.authService.getToken();
      if (token != null) {
        authReq = req.clone({
          headers: req.headers.set(
            SecurityConstants.TOKEN_HEADER_KEY,
            `${SecurityConstants.TOKEN_PREFIX} ${token}`
          ),
        });
      }
    }

    return next.handle(authReq);
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
