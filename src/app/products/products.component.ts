import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BalancesService } from '../_services/balances.service';
import { DownloadPDFService } from '../_services/download-pdf.service';
import { EncryptionService } from '../_services/encryption.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';

@Component({
  selector: 'DPOSW-products',
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {

  constructor(private encryptionService: EncryptionService,
      private activatedRoute: ActivatedRoute,
      private balancesService: BalancesService,
      private downloadPDFService: DownloadPDFService,
      private storageService: StorageService,
      private uiStateService: UIStateService,
      private sessionService: SessionService,
      private themeService: ThemeService) {
        
      this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
