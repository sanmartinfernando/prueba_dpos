import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from 'src/app/_services/session.service';

/**
 * Componente para cambiar el idioma de la aplicación y
 * actualizar la información de sesión relacionada con el idioma.
 */
@Component({
  selector: 'app-dpos-lang-switcher',
  templateUrl: './lang-switcher.component.html',
  styleUrls: []
})
export class LangSwitcherComponent {

  private translate = inject(TranslateService);
  private sessionService = inject(SessionService);

  constructor() {
    this.translate.addLangs(['es', 'eu', 'cat']);
    this.translate.setDefaultLang('es');

    const language = this.sessionService.getItem(SessionService.LANGUAGE) ?? 'es';

    this.translate.use(language).subscribe(() => {
      this.translate.get('dpos.filter.all').subscribe(translation => {
        this.sessionService.setItem(SessionService.TERMINAL_NUMBER, translation);
      });
    });
  }

  /**
   * Cambia el idioma de la aplicación en función de la selección del usuario.
   * @param event Evento de cambio de idioma desde el selector.
   */
  switchLang(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const isAllSelected =
      this.sessionService.getItem(SessionService.TERMINAL_NUMBER) === this.translate.instant('dpos.filter.all');

    this.translate.use(selectElement.value).subscribe(() => {
      this.translate.get('dpos.filter.all').subscribe(() => {
        if (isAllSelected) {
          this.sessionService.setItem(
            SessionService.TERMINAL_NUMBER,
            this.translate.instant('dpos.filter.all')
          );
        }
      });
    });
  }
}
