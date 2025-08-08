import { inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root',
})
export class InactivityService {

  private router = inject(Router);
  private ngZone = inject(NgZone);
  private storageService = inject(StorageService);

  private timeout: any;
  private readonly INACTIVITY_TIME = 30 * 60 * 1000;
  private readonly WARNING_TIME = 25 * 60 * 1000;
  private monitoringActive = false;

  constructor() { }

  startMonitoring() {
    this.monitoringActive = true;
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.resetTimer.bind(this));
      window.addEventListener('keydown', this.resetTimer.bind(this));
      window.addEventListener('scroll', this.resetTimer.bind(this));
      window.addEventListener('click', this.resetTimer.bind(this));
      this.resetTimer();
    });
  }

  resetTimer() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIME);

    setTimeout(() => {
      this.showInactivityWarning();
    }, this.WARNING_TIME);
  }

  private showInactivityWarning() {

  }

  public logout() {
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
    window.removeEventListener('mousemove', this.resetTimer.bind(this));
    window.removeEventListener('keydown', this.resetTimer.bind(this));
    window.removeEventListener('scroll', this.resetTimer.bind(this));
    window.removeEventListener('click', this.resetTimer.bind(this));
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}