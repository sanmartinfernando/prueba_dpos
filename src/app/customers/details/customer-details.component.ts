import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from '../../_services/encryption.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';

@Component({
  selector: 'DPOSW-customer-details',
  templateUrl: './customer-details.component.html',
})
export class CustomerDetailsComponent implements OnInit {

  loadCompleted: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private encryptionService: EncryptionService,
    private storageService: StorageService,
    private uiStateService: UIStateService,
    private sessionService: SessionService,
    private themeService: ThemeService
  ) {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    
    //Bloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(false);
  }

  ngOnInit(): void {
    const idCustomer = this.activatedRoute.snapshot.params['id'];
    if (idCustomer) {
      const iddecode = this.encryptionService.decode(idCustomer);
    }
    this.loadCompleted = true;
  }
}
