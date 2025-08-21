import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, timer, Subscription, shareReplay } from 'rxjs';
import { PortalUsersService } from './portal-users.service';
import { StorageService } from './storage.service';
import { PortalUserToken } from '../_models/portal-user-token.model';

/**
 * @class PortalUsersTokenService
 * @description
 * Servicio encargado de gestionar el ciclo de vida del token de PortalUsers.
 * - Obtiene y almacena el token de usuario en `StorageService`.
 * - Proporciona un token válido bajo demanda, renovándolo si está caducado.
 * - Programa la renovación automática unos segundos antes de la expiración.
 *
 * Implementa `OnDestroy` para liberar suscripciones activas.
 */
@Injectable({ providedIn: 'root' })
export class PortalUsersTokenService implements OnDestroy {

  private portalUsersService = inject(PortalUsersService);
  private storageService = inject(StorageService);

  private tokenSubject = new BehaviorSubject<PortalUserToken | null>(null);
  private refreshSub: Subscription | null = null;

  constructor() {
    const saved = this.storageService.get(StorageService.PORTAL_USERS_TOKEN);
    if (saved) {
      const parsed: PortalUserToken = JSON.parse(saved);
      this.tokenSubject.next(parsed);
      this.scheduleAutoRefresh(parsed);
    }
  }

  /**
   * Obtiene un token válido de PortalUsers.
   * - Si existe y no ha caducado, se devuelve directamente.
   * - Si ha caducado o no existe, se solicita uno nuevo al servicio remoto.
   *
   * @returns Observable con el token válido como cadena
   */
  getValidToken(): Observable<string> {
    const current = this.tokenSubject.value;

    if (current && !this.isExpired(current.expireAt)) {
      return of(current.token);
    }

    // obtener usuario y renovar token
    return this.storageService.userInfo.pipe(
      switchMap(user => this.portalUsersService.getToken(user)),
      switchMap(newToken => {
        this.setToken(newToken);
        return of(newToken.token);
      }),
      // evita llamadas duplicadas
      shareReplay(1)
    );
  }

  /**
   * Almacena un nuevo token en memoria y en StorageService.
   * Además, programa su renovación automática.
   *
   * @param token Token de PortalUsers
   */
  private setToken(token: PortalUserToken) {
    this.tokenSubject.next(token);
    this.storageService.set(StorageService.PORTAL_USERS_TOKEN, token);
    this.scheduleAutoRefresh(token);
  }

  /**
   * Almacena un nuevo token en memoria y en StorageService.
   * Además, programa su renovación automática.
   *
   * @param token Token de PortalUsers
   */
  private scheduleAutoRefresh(token: PortalUserToken) {
    // Cancelar cualquier timer anterior
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }

    const expiry = new Date(token.expireAt).getTime();
    const now = Date.now();

    // 30 segundos antes de expirar
    const refreshInMs = Math.max(expiry - now - 30_000, 0);

    this.refreshSub = timer(refreshInMs).pipe(
      switchMap(() => this.storageService.userInfo),
      switchMap(user => this.portalUsersService.getToken(user))
    ).subscribe({
      next: refreshed => this.setToken(refreshed),
      error: err => {
        console.error('Error al renovar token automáticamente', err);
        // si falla, lo intentará de nuevo en la siguiente petición con getValidToken()
      }
    });
  }

  /**
   * Verifica si un token ha caducado.
   *
   * @param expireAt Fecha/hora de expiración en formato string
   * @returns `true` si el token ya está caducado, `false` en caso contrario
   */
  private isExpired(expireAt: string): boolean {
    const expiry = new Date(expireAt).getTime();
    return (expiry - Date.now()) <= 0;
  }

  /**
   * Libera recursos al destruir el servicio.
   * Cancela el temporizador de auto-refresh si está activo.
   */
  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }
}
