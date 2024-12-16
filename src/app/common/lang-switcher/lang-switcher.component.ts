import { Component } from '@angular/core';
import {TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'DOPSW-lang-switcher',
  templateUrl: './lang-switcher.component.html',
  styleUrls: []
})
export class LangSwitcherComponent {

  constructor(private translate: TranslateService) {
    translate.addLangs(['es', 'eu', 'cat']);
    translate.setDefaultLang('es');
  }
  
  switchLang(event: Event): void {
    const lang = event.target as HTMLSelectElement;
    this.translate.use(lang.value);
  }
}
