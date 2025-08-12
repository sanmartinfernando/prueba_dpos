import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from '../../_services/encryption.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { Customer } from 'src/app/_models/customer.model';
import { PortalUsersService } from 'src/app/_services/portal-users.service';
import { AuthService } from 'src/app/_services/auth.service';
import { CustomersService } from 'src/app/_services/customers.service';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-dpos-customer-details',
  templateUrl: './customer-details.component.html',
})
export class CustomerDetailsComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private encryptionService = inject(EncryptionService);
  private portalUsersService = inject(PortalUsersService);
  private customersService = inject(CustomersService);
  private storageService = inject(StorageService);
  private uiStateService = inject(UIStateService);
  private sessionService = inject(SessionService);
  private translate = inject(TranslateService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  loadCompleted = false;
  idCustomer: string = null;
  commerceId: string = null;
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

  constructor() {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));

    //Bloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(false);
  }

  ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
          this.authService.setPortalUsersToken(portalUserToken.token);
          this.commerceId = this.sessionService.getItem(SessionService.COMMERCE_ID);
          const idParam = this.activatedRoute.snapshot.params['id'];
          if (idParam) {
            this.idCustomer = this.encryptionService.decode(idParam);
            this.getCustomer(this.idCustomer);
            this.titlePage = this.translate.instant('dpos.customer.details.page.edit.title');
          } else {
            this.titlePage = this.translate.instant('dpos.customer.details.page.add.title');
            this.loadCompleted = true;
          }
        },
        error: (error) => {
          console.error("Error Portal user token", error);
        }
      });
    });
  }

  public getCustomer(idClient: string): void {
    this.customersService.getCustomer(idClient, this.commerceId).subscribe({
      next: (client) => {
        this.customer = client;
        this.identityDocument = this.customer.identityDocument;
        this.name = this.customer.name;
        this.email = this.customer.email;
        this.phone = this.customer.phone;
        this.address = this.customer.address;
        this.city = this.customer.city;
        this.postcode = this.customer.postcode;
        this.country = this.customer.country;
        this.state = this.customer.state;
        this.loadCompleted = true;
      },
      error: () => {
        this.loadCompleted = true;
      }
    });
  }

  public saveCustomer(form: NgForm): void {

    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    
    if (this.customer) {
      this.updateCustomer();
    } else {
      this.createCustomer();
    }
  }

  private updateCustomer() {
    this.setCustomerFields();
    this.customersService.updateCustomer(this.customer, this.commerceId).subscribe({
      next: (customer) => {
        console.log(customer);
        this.code = '/customers';
      },
      error: () => {
        this.code = '/customers';
      }
    });
  }

  private createCustomer() {
    this.customer = new Customer();
    this.setCustomerFields();
    this.customersService.createCustomer(this.customer, this.commerceId).subscribe({
      next: (customer) => {
        console.log(customer);
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
    this.customer.email = this.email;
    this.customer.phone = this.phone;
    this.customer.address = this.address;
    this.customer.city = this.city;
    this.customer.postcode = this.postcode;
    this.customer.country = this.country;
    this.customer.state = this.state;
  }
}
