import { Component, OnInit, OnDestroy  } from '@angular/core';
import { InactivityService } from './_services/inactivity.service';

@Component({
  selector: 'DPOSW-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  navIsOpen = true;

  constructor(private inactivityService: InactivityService) {}

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
