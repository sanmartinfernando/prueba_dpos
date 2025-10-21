import { Component, inject, OnInit } from '@angular/core';
import { SessionService } from '../_services/session.service';
import { SettingsService } from '../_services/settings.service';

@Component({
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private sessionService = inject(SessionService);
  settings: any | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  commerceSelected: number;
  constructor() { }
  ngOnInit(): void {
    this.getSettings();
  }

  getSettings(): void {

    this.commerceSelected = this.sessionService.getItem(SessionService.COMMERCE_ID);

    if (!this.commerceSelected) {
      this.errorMessage = 'No se encontró el ID del comercio para cargar la configuración.';
      this.isLoading = false;
      return;
    }

    this.settingsService.getSettingsCommerce(this.commerceSelected.toString()).subscribe({
      next: (data) => {
        console.log('Configuración del comercio obtenida:', data);
        this.settings = data;
        this.sessionService.setItem(SessionService.TAX_TYPE, JSON.stringify(data.taxSettings.taxType));
                this.sessionService.setItem(SessionService.BILL_SYSTEM, JSON.stringify(data.billSystem));
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error al cargar la configuración:', err);
        this.errorMessage = 'Fallo al obtener la configuración del comercio.';
        this.isLoading = false;
        this.settings = null;
      }
    });
  }

}
