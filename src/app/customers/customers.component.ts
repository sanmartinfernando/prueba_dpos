import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from '../_services/encryption.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { PortalUsersService } from '../_services/portal-users.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Commerce } from '../_models/commerce.model';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { CustomersService } from '../_services/customers.service';
import { Customer } from '../_models/customer.model';


@Component({
  selector: 'app-dpos-customers',
  templateUrl: './customers.component.html',
})
export class CustomersComponent implements OnInit, OnDestroy {

  private encryptionService = inject(EncryptionService);
  private downloadCsvService = inject(DownloadCsvService);
  private storageService = inject(StorageService);
  private portalUsersService = inject(PortalUsersService);
  private customersService = inject(CustomersService);
  private commercesService = inject(CommercesService);
  private translate = inject(TranslateService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private authService = inject(AuthService);

  size = 10000;
  customers: Customer[] = [];
  page = 0;
  code: string;
  loadCompleted = false;
  validationVariable = false;
  commerceId = 0;
  Math = Math;
  masterSelected = false;

  //Parámetros de búsqueda
  public terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter = false;
  varSearch: string = null;
  customerNifVarSearch: string = null;
  customerNameVarSearch: string = null;
  customerLastNameVarSearch: string = null;
  customerPhoneVarSearch: string = null;
  customerEmailVarSearch: string = null;

  emptySearch = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  @ViewChild('customerFileInput') customerFileInput!: ElementRef<HTMLInputElement>;

  // Checkboxes
  selectedIndices: number[] = [];
  isAllSelected = false;
  counter = 0;

  currentLang: string;
  langSubscription: Subscription;

  commerceSelected: string;
  commerces: Commerce[];

  constructor() {

    //Desbloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(true);

    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
    });
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadCompleted = false;

    if (this.sessionService.getItem(SessionService.CUSTOMER_NIF) !== null) {
      this.customerNifVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_NIF);
    }
    if (this.sessionService.getItem(SessionService.CUSTOMER_NAME) !== null) {
      this.customerNameVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_NAME);
    }
    if (this.sessionService.getItem(SessionService.CUSTOMER_LASTNAME) !== null) {
      this.customerLastNameVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_LASTNAME);
    }
    if (this.sessionService.getItem(SessionService.CUSTOMER_PHONE) !== null) {
      this.customerPhoneVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_PHONE);
    }
    if (this.sessionService.getItem(SessionService.CUSTOMER_EMAIL) !== null) {
      this.customerEmailVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_EMAIL);
    }

    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
          this.authService.setPortalUsersToken(portalUserToken.token);
          this.commercesService.getCommerceList().subscribe({
            next: (commerces) => {
              this.commerces = commerces;
              this.sessionService.getCommerceId().subscribe((commerceId) => {
                if (commerceId !== 0) {
                  this.commerceId = commerceId; // Actualizar el valor en el componente
                } else {
                  this.commerceId = commerces[0].commerceId;
                  this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
                }
                this.themeService.loadTheme(this.getCommerceResellerName(commerces));
                this.commerceSelected = this.getCommerceNumber(this.commerceId);
                this.searchCustomers();
              });
            },
            error: (error) => {
              console.error("Error Commerces: ", error);
            }
          });
        },
        error: (error) => {
          console.error("Error Portal user token", error);
        }
      });
    });
  }

  searchCustomers() {
    this.validationVariable = false;
    this.loadCompleted = false;

    //Comienzo query búsqueda
    this.varSearch = "&qs={'and':[";

    //Commerce id
    if (this.commerceId !== 0) {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch =
        this.varSearch + "{'field':'CommerceId','op':'=','value':'" + this.commerceId + "'}";
    }

    //NIF
    if (this.customerNifVarSearch !== null && this.customerNifVarSearch !== "") {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'NIF','op':'=*.*','value':'" + this.customerNifVarSearch + "'}";
    }

    //Nombre
    if (this.customerNameVarSearch !== null && this.customerNameVarSearch !== "") {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'Name','op':'=*.*','value':'" + this.customerNameVarSearch + "'}";
    }

    //Apellidos
    if (this.customerLastNameVarSearch !== null && this.customerLastNameVarSearch !== "") {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'LastName','op':'=*.*','value':'" + this.customerLastNameVarSearch + "'}";
    }

    //Telefono
    if (this.customerPhoneVarSearch !== null && this.customerPhoneVarSearch !== "") {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'Phone','op':'=*.*','value':'" + this.customerPhoneVarSearch + "'}";
    }

    //Email
    if (this.customerEmailVarSearch !== null && this.customerEmailVarSearch !== "") {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'Email','op':'=*.*','value':'" + this.customerEmailVarSearch + "'}";
    }

    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;
    this.getCustomers();
  }

  private getCustomers() {
    this.emptySearch = true;
    this.loadCompleted = false;
    this.customersService.getCustomers(this.size, this.varSearch).subscribe({
      next: (customers) => {
        this.customers = customers.data;
        this.emptySearch = this.customers.length === 0;
        this.loadCompleted = true;
      },
      error: () => {
        this.customers = null;
        this.emptySearch = true;
        this.loadCompleted = true;
      }
    });
  }

  //Checkboxes
  selectAllCustomers() {
    for (const customer of this.customers) {
      customer.selected = this.masterSelected;
    }
  }

  checkIfAllSelected() {
    this.masterSelected = this.customers.every(c => c.selected);
  }

  //Encriptación
  sendCustomerDetails(id: string) {
    if (!id) {
      this.code = '/customer-details'
    } else {
      this.code = this.encryptionService.encryptData(id);
      this.code = '/customer-details/' + this.encryptionService.encode(this.code);
    }
  }

  //Eliminar clientes
  deleteCustomers() {
   // this.customers = this.customers.filter(customer => !customer.selected);
    if (this.customers.length === 0) {
      this.emptySearch = true;
    }
  }

  //Añadir cliente
  addCustomer() {
    this.sendCustomerDetails(null);
  }

  //Importar clientes
  importCustomers() {
    this.customerFileInput.nativeElement.click();
  }

  onCustomerFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;

      const { rows, errors } = this.parseCSV(text);

      if (errors.length <= 0) {
        const customers: Customer[] = [];
        for (const row of rows) {
          const customer: Customer = new Customer();
          customer.clientId = (customers.length+1).toString();
          customer.identityDocument = row[0];
          customer.name = row[1];
          customer.email = row[2];
          customer.phone = row[3];
          customer.address = row[4];
          customer.city = row[5];
          customer.postcode = row[6];
          customer.country = row[7];
          customer.state = row[8];
          customers.push(customer);
        }

        this.showModal = true;
        this.modalTitle = 'Importación de clientes';
        this.modalMessage = 'Clientes importados correctamente';

        if (!this.customers)
          this.customers = [];

        this.customers.push(...customers);

        if (this.customers.length > 0)
          this.emptySearch = false;
      }
    };

    reader.readAsText(file);
  }

  //Descargar clientes
  downloadCSV() {
    this.downloadCsvService.downloadCustomersFile(this.customers, this.translate.instant('dpos.customers.page.title'), this.currentLang);
  }

  closeModal() {
    this.showModal = false;
  }

  onCommerceChange(): void {
    this.commerceId = this.getCommerceId();
    this.searchCustomers();
  }

  onCustomerNifChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_NIF, this.customerNifVarSearch);
  }

  onCustomerNameChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_NAME, this.customerNameVarSearch);
  }

  onCustomerLastNameChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_LASTNAME, this.customerLastNameVarSearch);
  }

  onCustomerPhoneChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_PHONE, this.customerPhoneVarSearch);
  }

  onCustomerEmailChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_EMAIL, this.customerEmailVarSearch);
  }

  getCommerceId(): number {
    const commerce = this.commerces.find(commerce => commerce.commerceNumber === this.commerceSelected);
    if (commerce !== undefined) {
      return commerce.commerceId;
    }
    return 0;
  }

  getCommerceNumber(commerceId: number): string {
    const commerce = this.commerces.find(commerce => commerce.commerceId === commerceId);
    if (commerce !== undefined) {
      return commerce.commerceNumber;
    }
    return "";
  }

  cleanFormFields(): void {
    this.customerNifVarSearch = "";
    this.customerNameVarSearch = "";
    this.customerLastNameVarSearch = "";
    this.customerPhoneVarSearch = "";
    this.customerEmailVarSearch = "";
    this.sessionService.setItem(SessionService.CUSTOMER_NIF, this.customerNifVarSearch);
    this.sessionService.setItem(SessionService.CUSTOMER_NAME, this.customerNameVarSearch);
    this.sessionService.setItem(SessionService.CUSTOMER_LASTNAME, this.customerLastNameVarSearch);
    this.sessionService.setItem(SessionService.CUSTOMER_PHONE, this.customerPhoneVarSearch);
    this.sessionService.setItem(SessionService.CUSTOMER_EMAIL, this.customerEmailVarSearch);
  }

  private getCommerceResellerName(commerces: Commerce[]): string {
    const commerce = commerces.find(commerce => commerce.commerceId === this.commerceId);
    if (commerce !== undefined) {
      return commerce.resellerName;
    }
    return null;
  }

  private parseCSV(csv: string): { rows: string[][], errors: string[] } {
    const rows: string[][] = [];
    const errors: string[] = [];
    let currentRow: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];

      if (char === '"') {
        if (insideQuotes && csv[i + 1] === '"') {
          currentValue += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentValue);
        currentValue = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && csv[i + 1] === '\n') i++;
        currentRow.push(currentValue);
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    if (currentValue !== '' || currentRow.length > 0) {
      currentRow.push(currentValue);
      rows.push(currentRow);
    }

    // Validación de filas incompletas
    const expectedLength = rows[0]?.length ?? 0;

    rows.forEach((row, index) => {
      if (row.length !== expectedLength) {
        errors.push(
          `Error en la fila ${index + 1}: se esperaban ${expectedLength} columnas pero hay ${row.length}.`
        );
      }
    });

    return { rows, errors };
  }
}
