import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from '../../_services/encryption.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { Customer } from 'src/app/_models/customer.model';
import { CommercesService } from 'src/app/_services/commerces.service';
import { PortalUsersService } from 'src/app/_services/portal-users.service';
import { AuthService } from 'src/app/_services/auth.service';
import { CustomersService } from 'src/app/_services/customers.service';

@Component({
  selector: 'DPOSW-customer-details',
  templateUrl: './customer-details.component.html',
})
export class CustomerDetailsComponent implements OnInit {

  loadCompleted: boolean = false;
  idCustomer: string = null;
  titlePage: string;

  customer: Customer;

  constructor(
    private activatedRoute: ActivatedRoute,
    private encryptionService: EncryptionService,
    private portalUsersService: PortalUsersService,
    private commercesService: CommercesService,
    private customersService: CustomersService,
    private storageService: StorageService,
    private uiStateService: UIStateService,
    private sessionService: SessionService,
    private translate: TranslateService,
    private themeService: ThemeService,
    private authService: AuthService
  ) {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    
    //Bloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(false);
  }

  ngOnInit(): void {

    this.storageService.userInfo.subscribe((user) =>{
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken)=> {
          this.authService.setPortalUsersToken(portalUserToken.token);
          
          const idParam = this.activatedRoute.snapshot.params['id'];
          if (idParam) {
            this.idCustomer = this.encryptionService.decode(idParam);
            this.titlePage = this.translate.instant('dpos.customer.details.page.edit.title');
            this.getCustomer(idParam);
          } else {
            this.titlePage = this.translate.instant('dpos.customer.details.page.add.title');
          }

          this.loadCompleted = true;

        },
        error: (error) => {
          console.error("Error Portal user token", error);
        }
      });
    });
  }
  
  public getCustomer(idClient: string): void {
    this.customersService.getCustomer(idClient).subscribe({
      next: (customerResponse) => {
        this.customer = customerResponse.client;
      },
      error: (error) => {
        //TODO: Control de errores
      }
    });
  }
}
