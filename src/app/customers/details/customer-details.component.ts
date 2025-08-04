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
  code: string;

  identityDocument: string;
  name: string;
  lastname: string;
  email: string; 
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  state: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private encryptionService: EncryptionService,
    private portalUsersService: PortalUsersService,
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
            this.getCustomer(this.idCustomer);
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
        this.identityDocument = this.customer.identityDocument;
        this.name = this.customer.name;
        this.lastname = this.customer.lastName;
        this.email = this.customer.email; 
        this.phone = this.customer.phone;
        this.address = this.customer.address;
        this.city = this.customer.city;
        this.postcode = this.customer.postcode;
        this.country = this.customer.country;
        this.state = this.customer.state;
      },
      error: (error) => {
        //TODO: Control de errores
      }
    });
  }

  public saveCustomer(): void {
    if(this.customer) {
      this.updateCustomer();
    } else {
      this.createCustomer();
    }
  }

  private updateCustomer() {

    this.setCustomerFields();

    this.customersService.updateCustomer(this.customer.clientId, this.customer).subscribe({
      next: (customerResponse) => {
        this.code = '/customers';
      },
      error: (error) => {
        //TODO: Control de errores
        this.code = '/customers';
      }
    });
  }

  private createCustomer() {

    this.customer = new Customer();
    this.setCustomerFields();

    this.customersService.createCustomer(this.customer).subscribe({
      next: (customerResponse) => {
        console.log(customerResponse);
        this.code = '/customers';
      },
      error: (error) => {
        console.log(error);
        //TODO: Control de errores
        this.code = '/customers';
      }
    });
  }

  private setCustomerFields() {
    this.customer.identityDocument = this.identityDocument;
    this.customer.name = this.name;
    this.customer.lastName = this.lastname;
    this.customer.email = this.email; 
    this.customer.phone = this.phone;
    this.customer.address = this.address;
    this.customer.city = this.city;
    this.customer.postcode = this.postcode;
    this.customer.country = this.country;
    this.customer.state = this.state;
  }
}
