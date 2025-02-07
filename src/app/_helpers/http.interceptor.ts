import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from '../_services/auth.service';
import { RestRoutes } from '../_config/rest-routes.config';
import { SecurityConstants } from '../_config/security-constants.config';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authReq = req;
    if (req.url.endsWith(RestRoutes.AUTH)) {
      return next.handle(req);
    }
    if (req.url.includes('PortalUsers/commerces') || req.url.includes('PortalUsers/terminals')) {
      const token = this.authService.getPortalUsersToken();
      if (token != null) {
        authReq = req.clone({
          headers: req.headers.set(
            SecurityConstants.TOKEN_HEADER_KEY,
            `${SecurityConstants.TOKEN_PREFIX} ${token}`
          ),
        });
      }
    } else if (req.url.includes('wsenrollment')) {
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
