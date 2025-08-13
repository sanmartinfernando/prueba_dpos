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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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
  private fb = inject(FormBuilder);

  loadCompleted = false;
  idCustomer: string = null;
  commerceId: string = null;
  titlePage: string;

  customer: Customer;
  code: string;

  clientForm: FormGroup;
  
  constructor() {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));

    //Bloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(false);

    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      identityDocument: ['', [Validators.required, Validators.pattern(/^(?:[0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[KLM][0-9]{7}[A-Z]|[ABCDEFGHJNPQRSUVW][0-9]{7}[A-Z0-9])$/)]],
      address: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 ,.\-/]+$/)]],
      city: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      state: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      country: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      postcode: ['', [Validators.required, Validators.pattern(/^(?:0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(?:\+34|0034|34)?(?:\d{9}|\d{3}\d{3}\d{3})$/)]],
    });
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
        this.clientForm.setValue({
          identityDocument: this.customer.identityDocument,
          name: this.customer.name,
          email: this.customer.email,
          phone: this.customer.phone,
          address: this.customer.address,
          city: this.customer.city,
          postcode: this.customer.postcode,
          country: this.customer.country,
          state: this.customer.state
        });
        this.loadCompleted = true;
      },
      error: () => {
        this.loadCompleted = true;
      }
    });
  }

  public saveCustomer(): void {
    if (this.clientForm.invalid) {
      // Marcar todos los controles como tocados para mostrar errores
      this.clientForm.markAllAsTouched();
      return; // evitar submit si está inválido
    }
    if (this.customer) {
      this.updateCustomer();
    } else {
      this.createCustomer();
    }
  }

  private updateCustomer() {
    this.setCustomerFields();
    this.customersService.saveCustomer(this.customer, this.commerceId).subscribe({
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
    this.customersService.saveCustomer(this.customer, this.commerceId).subscribe({
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
    this.customer.identityDocument = this.clientForm.get('identityDocument').value;
    this.customer.name = this.clientForm.get('name').value;
    this.customer.email = this.clientForm.get('email').value;
    this.customer.phone = this.clientForm.get('phone').value;
    this.customer.address = this.clientForm.get('address').value;
    this.customer.city = this.clientForm.get('city').value;
    this.customer.postcode = this.clientForm.get('postcode').value;
    this.customer.country = this.clientForm.get('country').value;
    this.customer.state = this.clientForm.get('state').value;
  }
}
