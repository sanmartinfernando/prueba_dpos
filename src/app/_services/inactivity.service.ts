import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private timeout: any;
  private readonly INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos
  private readonly WARNING_TIME = 25 * 60 * 1000; // Alerta de inactividad después de 25 minutos

  private monitoringActive: boolean = false;
  
  constructor(private router: Router, private ngZone: NgZone, private storageService: StorageService) {}

  startMonitoring() {
    this.monitoringActive = true;
    // Se escucha por eventos de interacción del usuario
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.resetTimer.bind(this));
      window.addEventListener('keydown', this.resetTimer.bind(this));
      window.addEventListener('scroll', this.resetTimer.bind(this));
      window.addEventListener('click', this.resetTimer.bind(this));

      this.resetTimer(); // Comienza el timer al inicio
    });
  }

  resetTimer() {
    // Cancela cualquier timeout previo
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Establece un nuevo timeout para el logout
    this.timeout = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIME);

    // Si está a punto de expirar, podemos mostrar una alerta o realizar otro tipo de acción
    setTimeout(() => {
      this.showInactivityWarning();
    }, this.WARNING_TIME);
  }

  private showInactivityWarning() {
    // Aquí podemos mostrar un modal o una alerta para notificar al usuario.
  }

  private logout() {
    this.storageService.clean();
    window.location.reload();
    this.storageService.updateloggin(false);
    this.router.navigate(['/login']);
  }

  isMonitoringActive(): boolean {
    return this.monitoringActive;
  }
  
  stopMonitoring() {
    this.monitoringActive = false;
    // Remueve los event listeners para no seguir monitoreando
    window.removeEventListener('mousemove', this.resetTimer.bind(this));
    window.removeEventListener('keydown', this.resetTimer.bind(this));
    window.removeEventListener('scroll', this.resetTimer.bind(this));
    window.removeEventListener('click', this.resetTimer.bind(this));
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}