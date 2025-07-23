import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BalancesService } from 'src/app/_services/balances.service';
import { DownloadPDFService } from 'src/app/_services/download-pdf.service';
import { EncryptionService } from 'src/app/_services/encryption.service';
import { SessionService } from 'src/app/_services/session.service';
import { StorageService } from 'src/app/_services/storage.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';

@Component({
  selector: 'DPOSW-product-details',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {

  constructor(private encryptionService: EncryptionService,
      private activatedRoute: ActivatedRoute,
      private balancesService: BalancesService,
      private downloadPDFService: DownloadPDFService,
      private storageService: StorageService,
      private uiStateService: UIStateService,
      private sessionService: SessionService,
      private themeService: ThemeService) {
        
      this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
  
      //Bloqueamos el selector de comercio;
      this.uiStateService.setFormSelectEnabled(false);
    }
    
    ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
