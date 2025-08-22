import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CustomersService } from 'src/app/_services/customers.service';
import { EncryptionService } from 'src/app/_services/encryption.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';

import { Customer } from 'src/app/_models/customer.model';

/**
 * @class CustomerDetailsComponent
 * @description
 * Componente para gestionar el detalle de clientes.
 * Permite visualizar, crear y editar datos de clientes asociados a un comercio.
 */
@Component({
  selector: 'app-dpos-customer-details',
  templateUrl: './customer-details.component.html',
})
export class CustomerDetailsComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private encryptionService = inject(EncryptionService);
  private customersService = inject(CustomersService);
  private uiStateService = inject(UIStateService);
  private sessionService = inject(SessionService);
  private translate = inject(TranslateService);
  private themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isLoading = false;
  idCustomer: string = null;
  commerceId: string = null;
  titlePage: string;

  customer: Customer;

  clientForm: FormGroup;

  showModal = false;
  modalTitle = '';
  modalMessage = '';

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
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

  /**
   * Inicializa el componente cargando el token de usuario y, si corresponde, los datos del cliente.
   */
  ngOnInit(): void {
    this.commerceId = this.sessionService.getItem(SessionService.COMMERCE_ID);
    const idParam = this.activatedRoute.snapshot.params['id'];
    if (idParam) {
      this.idCustomer = this.encryptionService.decode(idParam);
      this.getCustomer(this.idCustomer);
      this.titlePage = this.translate.instant('dpos.customer.details.page.edit.title');
    } else {
      this.titlePage = this.translate.instant('dpos.customer.details.page.add.title');
      this.isLoading = false;
    }
  }

  /**
   * Obtiene los datos de un cliente por su ID y los asigna al formulario.
   * 
   * @param idClient Identificador del cliente.
   */
  public getCustomer(idClient: string): void {
    this.isLoading = true;
    this.customersService.getCustomer(idClient, this.commerceId).subscribe({
      next: (client) => {
        this.customer = client;
        this.clientForm.setValue({
          identityDocument: client.identityDocument,
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          city: client.city,
          postcode: client.postcode,
          country: client.country,
          state: client.state
        });
        this.isLoading = false;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.customer.detail'));
        this.isLoading = false;
      }
    });
  }

  /**
   * Guarda los datos del cliente, creando o actualizando según corresponda.
   */
  public saveCustomer(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }
    if (this.customer) {
      this.updateCustomer();
    } else {
      this.createCustomer();
    }
  }

  /**
   * Abre el modal de mensajes estableciendo el título y el mensaje.
   *
   * @param title   Texto que se mostrará como título del modal.
   * @param message Texto que se mostrará como contenido del modal.
   */
  public openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  /**
   * Cierra el modal de mensajes.
   */
  public closeModal() {
    this.showModal = false;
    this.router.navigate(['/customers']);
  }

  /**
   * Actualiza un cliente existente.
   */
  private updateCustomer(): void {
    this.isLoading = true;
    this.setCustomerFields();
    this.customersService.saveCustomer(this.customer, this.commerceId).subscribe({
      next: () => {
        this.openModal(this.translate.instant('dpos.customer.details.modal.edit.title'), this.translate.instant('dpos.customer.details.modal.edit.message'));
        this.isLoading = false;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.customer.update'));
        this.isLoading = false;
      }
    });
  }

  /**
   * Crea un nuevo cliente.
   */
  private createCustomer(): void {
    this.isLoading = true;
    this.customer = new Customer();
    this.setCustomerFields();
    this.customersService.saveCustomer(this.customer, this.commerceId).subscribe({
      next: () => {
        this.openModal(this.translate.instant('dpos.customer.details.modal.create.title'), this.translate.instant('dpos.customer.details.modal.create.message'));
        this.isLoading = false;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.customer.create'));
        this.isLoading = false;
      }
    });
  }

  /**
   * Asigna los valores del formulario al objeto `Customer`.
   */
  private setCustomerFields(): void {
    Object.assign(this.customer, this.clientForm.value);
  }
}
