import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { InactivityService } from './_services/inactivity.service';
import { StorageService } from './_services/storage.service';

/**
 * @class AppComponent
 * @description
 * Componente raíz de la aplicación.
 * Gestiona el estado de navegación y el monitoreo de inactividad del usuario.
 */
@Component({
  selector: 'app-dpos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private inactivityService = inject(InactivityService);

  public navIsOpen = true;
  isIframe = window.self !== window.top;
  /**
   * Inicializa el componente y comienza el monitoreo de inactividad.
   */
  ngOnInit(): void {
    this.inactivityService.startMonitoring();
    console.log('AppComponent is running inside an iframe:', this.isIframe);
  }

  /**
   * Detiene el monitoreo de inactividad antes de destruir el componente.
   */
  ngOnDestroy(): void {
    this.inactivityService.stopMonitoring();
  }

  /**
   * Actualiza el estado del menú de navegación.
   * 
   * @param isOpen Indica si el menú debe mostrarse abierto.
   */
  public onNavToggled(isOpen: boolean): void {
    this.navIsOpen = isOpen;
  }
}
