import { Component, OnInit, OnDestroy, inject  } from '@angular/core';
import { InactivityService } from './_services/inactivity.service';

@Component({
  selector: 'app-dpos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  
  private inactivityService = inject(InactivityService);

  navIsOpen = true;

  constructor() {}

  ngOnInit() {
    // Comienza a monitorear la inactividad cuando se carga el componente
    this.inactivityService.startMonitoring();
  }

  ngOnDestroy() {
    // Detener el monitoreo si el componente se destruye
    this.inactivityService.stopMonitoring();
  }

  onNavToggled(isOpen: boolean) {
    this.navIsOpen = isOpen;
  }
}
