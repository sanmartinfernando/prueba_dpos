import { inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { catchError, Observable, throwError, switchMap } from 'rxjs';
import { InactivityService } from '../_services/inactivity.service';
import { TranslateService } from '@ngx-translate/core';
import { RestRoutes } from './rest-routes.config';
import { SecurityConstants } from './security-constants.config';
import { ErrorResponse } from '../_models/error-response.model';
import { PortalUsersTokenService } from '../_services/portal-users-token.service';
import { TokenStorageService } from '../_services/token-storage.service';

/**
 * @class HttpRequestInterceptor
 * @description
 * Interceptor HTTP que añade tokens de autenticación a las peticiones según el endpoint destino.
 * Además, captura errores HTTP para gestionar respuestas no autorizadas (401).
 * Casos de uso:
 * - Peticiones a `RestRoutes.AUTH` → no se añade token.
 * - Peticiones a `PortalUsers/commerces` o `PortalUsers/terminals` → se añade un token renovable de PortalUsers.
 * - Peticiones a `wsenrollment` → se añade un segundo token (`token2`).
 * - Resto de peticiones → se añade el token principal del usuario.
 * Si ocurre un error HTTP 401, se fuerza el cierre de sesión mediante `InactivityService`.
 */
@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  private inactivityService = inject(InactivityService);
  private translate = inject(TranslateService);
  private portalUsersTokenService = inject(PortalUsersTokenService);
  private tokenStorage = inject(TokenStorageService);

  /**
   * Intercepta todas las peticiones HTTP salientes para inyectar cabeceras de autenticación.
   *
   * @param req Petición HTTP original
   * @param next Manejador que envía la petición al siguiente interceptor o al backend
   * @returns Observable con la respuesta del backend
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url.endsWith(RestRoutes.AUTH)) {
      return next.handle(req);
    }
    //Peticiones de PortalUsers → siempre usan token renovable
    if (req.url.includes('PortalUsers/commerces') || req.url.includes('PortalUsers/terminals')) {
      return this.portalUsersTokenService.getValidToken().pipe(
        switchMap(token => {
          let authReq = req.clone({
            headers: req.headers.set(
              SecurityConstants.TOKEN_HEADER_KEY,
              `${SecurityConstants.TOKEN_PREFIX} ${token}`
            ),
          });
          authReq = this.applySecurityHeaders(authReq);
          return next.handle(authReq);
        }),
        catchError(err => this.handleError(err))
      );
    }
    //Peticiones a wsenrollment → usan token2
    if (req.url.includes('wsenrollment')) {
      const token2 = this.tokenStorage.getToken2();
      if (token2) {
        req = req.clone({
          headers: req.headers.set(
            SecurityConstants.TOKEN_HEADER_KEY,
            `${SecurityConstants.TOKEN_PREFIX} ${token2}`
          ),
        });
      }
      req = this.applySecurityHeaders(req);
      return next.handle(req).pipe(catchError(err => this.handleError(err)));
    }
    //Resto de peticiones → token principal
    const token = this.tokenStorage.getToken();
    if (token) {
      req = req.clone({
        headers: req.headers.set(
          SecurityConstants.TOKEN_HEADER_KEY,
          `${SecurityConstants.TOKEN_PREFIX} ${token}`
        ),
      });
    }
    req = this.applySecurityHeaders(req);
    return next.handle(req).pipe(catchError(err => this.handleError(err)));
  }
  private applySecurityHeaders(req: HttpRequest<any>): HttpRequest<any> {
    let headers = req.headers

     .set(
        'Content-Security-Policy',
        "default-src 'self'; style-src 'self' fonts.googleapis.com 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='; font-src fonts.gstatic.com; connect-src 'self' *.dpos.es"
      )
      .set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
      .set('Cross-Origin-Resource-Policy', 'same-site')
      .set('X-Content-Type-Options', 'nosniff')
      .set('X-Frame-Options', 'DENY')
      .set('Referrer-Policy', 'strict-origin-when-cross-origin')
      .set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()')
      .set('Cross-Origin-Embedder-Policy', 'require-corp')
      .set('Cross-Origin-Opener-Policy', 'same-origin')
      .set('Server', 'webserver'); 

    return req.clone({ headers });
  }


  /**
   * Maneja los errores HTTP centralmente.
   * Si el error es 401 (no autorizado), se cierra la sesión del usuario.
   *
   * @param error Error HTTP recibido
   * @returns Observable que lanza el error hacia el flujo de RxJS
   */
  private handleError(error: HttpErrorResponse) {
  const apiError: ErrorResponse = {
    StatusCode: error.status,
    ErrorCode: error.error?.ErrorCode ?? 0,
    ErrorCodeId: error.error?.ErrorCodeId ?? 'Default',
    Message: error.error?.Message ?? this.translate.instant('dpos.error.msg.api'),
  };
  if (apiError.StatusCode === 401) {
    console.warn('Error 401 no autorizado, cerrando sesión...');
    this.inactivityService.logout();
  }
  return throwError(() => error);
}
}

/**
 * Proveedor del interceptor HTTP para incluirlo en el módulo principal.
 */
export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
