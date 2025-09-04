import { Component, inject } from '@angular/core';
import { Commerce } from 'src/app/_models/commerce.model';
import { CommercesService } from 'src/app/_services/commerces.service';
import { SessionService } from 'src/app/_services/session.service';

/**
 * @class FooterComponent
 * @description
 * Componente encargado de renderizar el pie de página del portal Web.
 */
@Component({
  selector: 'app-dpos-footer',
  templateUrl: './footer.component.html',
  styleUrls: []
})
export class FooterComponent {
  
  private commercesService = inject(CommercesService);
  private sessionService = inject(SessionService);
  isComercia: boolean = false;

  ngOnInit(): void {
    this.commercesService.getCommerceList().subscribe({
      next: () => {
        this.sessionService.getCommerceId().subscribe(() => {
          this.isComercia = this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
        });
      },
      error: (error) => {
        console.error("Error Commerces: ", error);
      }
    });
  }
}
