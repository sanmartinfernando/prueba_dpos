import { inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

/**
 * @class InactivityService
 * @description
 * Servicio para detectar inactividad del usuario y cerrar sesión automáticamente
 * después de un periodo configurado sin interacción.
 */
@Injectable({ providedIn: 'root' })
export class InactivityService {
  
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private storageService = inject(StorageService);

  private timeout: any;
  private readonly INACTIVITY_TIME = 30 * 60 * 1000;
  private monitoringActive = false;

  /**
   * Inicia el monitoreo de inactividad del usuario.
   */
  public startMonitoring(): void {
    this.monitoringActive = true;
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.resetTimer.bind(this));
      window.addEventListener('keydown', this.resetTimer.bind(this));
      window.addEventListener('scroll', this.resetTimer.bind(this));
      window.addEventListener('click', this.resetTimer.bind(this));
      this.resetTimer();
    });
  }

  /**
   * Detiene el monitoreo de inactividad.
   */
  public stopMonitoring(): void {
    this.monitoringActive = false;
    window.removeEventListener('mousemove', this.resetTimer.bind(this));
    window.removeEventListener('keydown', this.resetTimer.bind(this));
    window.removeEventListener('scroll', this.resetTimer.bind(this));
    window.removeEventListener('click', this.resetTimer.bind(this));
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  /**
   * Verifica si el monitoreo de inactividad está activo.
   * 
   * @returns True si el monitoreo está activo, false en caso contrario.
   */
  public isMonitoringActive(): boolean {
    return this.monitoringActive;
  }

  /**
   * Cierra la sesión del usuario y redirige a la página de inicio de sesión.
   */
  public logout(): void {
    this.storageService.clean();
    window.location.reload();
    this.storageService.updateloggin(false);
    this.router.navigate(['/login']);
  }

  /**
   * Reinicia el temporizador de inactividad.
   */
  private resetTimer(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIME);
  }
}
