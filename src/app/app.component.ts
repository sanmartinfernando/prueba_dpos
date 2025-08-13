import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { InactivityService } from './_services/inactivity.service';

/**
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

  /**
   * Inicializa el componente y comienza el monitoreo de inactividad.
   */
  ngOnInit(): void {
    this.inactivityService.startMonitoring();
  }

  /**
   * Detiene el monitoreo de inactividad antes de destruir el componente.
   */
  ngOnDestroy(): void {
    this.inactivityService.stopMonitoring();
  }

  /**
   * Actualiza el estado del menú de navegación.
   * @param isOpen Indica si el menú debe mostrarse abierto.
   */
  public onNavToggled(isOpen: boolean): void {
    this.navIsOpen = isOpen;
  }
}
