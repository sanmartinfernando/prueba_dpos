import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from '../../_services/encryption.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'DPOSW-customer-details',
  templateUrl: './customer-details.component.html',
})
export class CustomerDetailsComponent implements OnInit {

  loadCompleted: boolean = false;
  idCustomer: string = null;
  titlePage: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private encryptionService: EncryptionService,
    private storageService: StorageService,
    private uiStateService: UIStateService,
    private sessionService: SessionService,
    private translate: TranslateService,
    private themeService: ThemeService
  ) {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    
    //Bloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(false);
  }

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.params['id'];

    console.log("--: " + idParam);

    if (idParam) {
      this.idCustomer = this.encryptionService.decode(idParam);
      this.titlePage = this.translate.instant('dpos.customer.details.page.edit.title');
    } else {
      this.titlePage = this.translate.instant('dpos.customer.details.page.add.title');
    }

    this.loadCompleted = true;
  }
}
