import { Component } from '@angular/core';
import {TranslateService } from '@ngx-translate/core';
import { SessionService } from 'src/app/_services/session.service';

@Component({
  selector: 'DOPSW-lang-switcher',
  templateUrl: './lang-switcher.component.html',
  styleUrls: []
})
export class LangSwitcherComponent {

  constructor(private translate: TranslateService,
    private sessionService: SessionService) {

      translate.addLangs(['es', 'eu', 'cat']);
      translate.setDefaultLang('es');

      let language: string = sessionService.getItem(SessionService.LANGUAGE);
      language = language != null ? language : 'es';

      this.translate.use(language).subscribe(() => {
        this.translate.get('dpos.filter.all').subscribe((translation: string) => {
          this.sessionService.setItem(SessionService.TERMINAL_NUMBER, translation);
        });
      });
  }
  
  switchLang(event: Event): void {
    const lang = event.target as HTMLSelectElement;

    let isAllSelected: boolean = this.sessionService.getItem(SessionService.TERMINAL_NUMBER) != null && this.sessionService.getItem(SessionService.TERMINAL_NUMBER) == this.translate.instant('dpos.filter.all');

    this.translate.use(lang.value).subscribe(() => {
      this.translate.get('dpos.filter.all').subscribe((translation: string) => {
        if(isAllSelected) {
          this.sessionService.setItem(SessionService.TERMINAL_NUMBER, this.translate.instant('dpos.filter.all'));
        }
      });
    });
  }
}
