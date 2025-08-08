import { inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { AuthService } from '../_services/auth.service';
import { RestRoutes } from './rest-routes.config';
import { SecurityConstants } from './security-constants.config';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { InactivityService } from '../_services/inactivity.service';


@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  private authService = inject(AuthService);
  private router = inject(Router); 
  private inactivityService = inject(InactivityService);

  constructor() { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    if (req.url.endsWith(RestRoutes.AUTH)) {
      return next.handle(req);
    }
    if (req.url.includes('PortalUsers/commerces') || req.url.includes('PortalUsers/terminals')) {
      const token = this.authService.getPortalUsersToken();
      if (token !== null) {
        authReq = req.clone({
          headers: req.headers.set(
            SecurityConstants.TOKEN_HEADER_KEY,
            `${SecurityConstants.TOKEN_PREFIX} ${token}`
          ),
        });
      }
    } else if (req.url.includes('wsenrollment')) {
      const token = this.authService.getToken2();
      if (token !== null) {
        authReq = req.clone({
          headers: req.headers.set(
            SecurityConstants.TOKEN_HEADER_KEY,
            `${SecurityConstants.TOKEN_PREFIX} ${token}`
          ),
        });
      }
    } else {
      const token = this.authService.getToken();
      if (token !== null) {
        authReq = req.clone({
          headers: req.headers.set(
            SecurityConstants.TOKEN_HEADER_KEY,
            `${SecurityConstants.TOKEN_PREFIX} ${token}`
          ),
        });
      }
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('Error 401 no autorizado, redirigiendo o cerrando sesión...');
          this.inactivityService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
