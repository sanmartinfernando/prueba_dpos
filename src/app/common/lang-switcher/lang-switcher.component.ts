import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from 'src/app/_services/session.service';


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

    let language: string = this.sessionService.getItem(SessionService.LANGUAGE);
    language = language !== null ? language : 'es';

    this.translate.use(language).subscribe(() => {
      this.translate.get('dpos.filter.all').subscribe((translation: string) => {
        this.sessionService.setItem(SessionService.TERMINAL_NUMBER, translation);
      });
    });
  }

  switchLang(event: Event): void {
    const lang = event.target as HTMLSelectElement;
    const isAllSelected: boolean = this.sessionService.getItem(SessionService.TERMINAL_NUMBER) !== null && this.sessionService.getItem(SessionService.TERMINAL_NUMBER) === this.translate.instant('dpos.filter.all');
    this.translate.use(lang.value).subscribe(() => {
      this.translate.get('dpos.filter.all').subscribe(() => {
        if (isAllSelected) {
          this.sessionService.setItem(SessionService.TERMINAL_NUMBER, this.translate.instant('dpos.filter.all'));
        }
      });
    });
  }
}
