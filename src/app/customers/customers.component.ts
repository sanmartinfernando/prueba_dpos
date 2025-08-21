import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { CommercesService } from '../_services/commerces.service';
import { CustomersService } from '../_services/customers.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { EncryptionService } from '../_services/encryption.service';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { Commerce } from '../_models/commerce.model';
import { Customer } from '../_models/customer.model';

/**
 * @class CustomersComponent
 * @description
 * Componente para la gestión de clientes.
 * Permite búsqueda, importación, exportación, alta y baja de clientes.
 */
@Component({
  selector: 'app-dpos-customers',
  templateUrl: './customers.component.html',
})
export class CustomersComponent implements OnInit, OnDestroy {

  private encryptionService = inject(EncryptionService);
  private downloadCsvService = inject(DownloadCsvService);
  private customersService = inject(CustomersService);
  private commercesService = inject(CommercesService);
  private translate = inject(TranslateService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private router = inject(Router);

  Math: Math;

  size = 10000;
  customers: Customer[] = [];
  page = 0;
  code: string;
  loadCompleted = false;
  validationVariable = false;
  commerceId = 0;
  masterSelected = false;

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

  selectedIndices: number[] = [];
  isAllSelected = false;
  counter = 0;

  currentLang: string;
  langSubscription: Subscription;

  commerceSelected: string;
  commerces: Commerce[];

  constructor() {
    this.uiStateService.setFormSelectEnabled(true);
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
    });
  }

  /**
   * Libera recursos.
   */
  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
  }

  /**
   * Inicializa el componente cargando datos de sesión, comercios y clientes.
   */
  ngOnInit(): void {
    this.loadCompleted = false;
    this.restoreSearchParams();
    this.loadCommerces();
  }

  /**
   * Ejecuta la búsqueda de clientes con los filtros actuales.
   */
  public searchCustomers(): void {
    this.validationVariable = false;
    this.loadCompleted = false;
    this.varSearch = "&qs={'and':[";
    const filters = [
      { field: 'CommerceId', value: this.commerceId, op: '=' },
      { field: 'NIF', value: this.customerNifVarSearch, op: '=*.*' },
      { field: 'Name', value: this.customerNameVarSearch, op: '=*.*' },
      { field: 'LastName', value: this.customerLastNameVarSearch, op: '=*.*' },
      { field: 'Phone', value: this.customerPhoneVarSearch, op: '=*.*' },
      { field: 'Email', value: this.customerEmailVarSearch, op: '=*.*' }
    ].filter(f => f.value);

    this.varSearch += filters.map(f => `{'field':'${f.field}','op':'${f.op}','value':'${f.value}'}`).join(',');
    this.varSearch += ']}';
    this.getCustomers();
  }

  /**
   * Verifica si todos los clientes están seleccionados.
   */
  public checkIfAllSelected(): void {
    this.masterSelected = this.customers.every(c => c.selected);
  }

  /**
   * Navega a la vista de detalle de un cliente.
   * 
   * @param id Identificador del cliente
   */
  public sendCustomerDetails(id: string): void {
    const route = id
      ? `/customer-details/${this.encryptionService.encode(this.encryptionService.encryptData(id))}`
      : '/customer-details';
    this.router.navigate([route]);
  }

  /**
   * Elimina los clientes seleccionados de la lista.
   */
  public deleteCustomers(): void {
    this.customers = this.customers.filter(c => !c.selected);
    this.emptySearch = this.customers.length === 0;
  }

  /**
   * Lanza la acción para añadir un nuevo cliente.
   */
  public addCustomer(): void {
    this.sendCustomerDetails(null);
  }

  /**
   * Abre el selector de archivos para importar clientes.
   */
  public importCustomers(): void {
    this.customerFileInput.nativeElement.click();
  }

  /**
   * Procesa un archivo CSV con datos de clientes.
   * 
   * @param event Evento de selección de archivo
   */
  public onCustomerFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const reader = new FileReader();
    reader.onload = () => this.processImportedCSV(reader.result as string);
    reader.readAsText(input.files[0]);
  }

  /**
   * Descarga la lista de clientes en formato CSV.
   */
  public downloadCSV(): void {
    this.downloadCsvService.downloadCustomersFile(
      this.customers,
      this.translate.instant('dpos.customers.page.title'),
      this.currentLang
    );
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
   * Cierra la ventana modal.
   */
  public closeModal(): void {
    this.showModal = false;
  }
  
  /**
   * Guarda en la sesión el NIF del cliente introducido en el campo de búsqueda.
   */
  public onCustomerNifChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_NIF, this.customerNifVarSearch);
  }

  /**
   * Guarda en la sesión el nombre del cliente introducido en el campo de búsqueda.
   */
  public onCustomerNameChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_NAME, this.customerNameVarSearch);
  }

  /**
   * Guarda en la sesión el teléfono del cliente introducido en el campo de búsqueda.
   */
  public onCustomerPhoneChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_PHONE, this.customerPhoneVarSearch);
  }

  /**
   * Guarda en la sesión el email del cliente introducido en el campo de búsqueda.
   */
  public onCustomerEmailChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_EMAIL, this.customerEmailVarSearch);
  }

  /**
   * Limpia todos los campos de búsqueda y sincroniza los cambios en la sesión.
   */
  public cleanFormFields(): void {
    this.customerNifVarSearch = '';
    this.customerNameVarSearch = '';
    this.customerLastNameVarSearch = '';
    this.customerPhoneVarSearch = '';
    this.customerEmailVarSearch = '';
    this.onCustomerNifChange();
    this.onCustomerNameChange();
    this.onCustomerPhoneChange();
    this.onCustomerEmailChange();
  }
  
  /**
   * Restaura los parámetros de búsqueda desde la sesión.
   */
  private restoreSearchParams(): void {
    this.customerNifVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_NIF) ?? null;
    this.customerNameVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_NAME) ?? null;
    this.customerLastNameVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_LASTNAME) ?? null;
    this.customerPhoneVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_PHONE) ?? null;
    this.customerEmailVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_EMAIL) ?? null;
  }

  /**
   * Carga la lista de comercios y configura el comercio activo.
   */
  private loadCommerces(): void {
    this.commercesService.getCommerceList().subscribe({
      next: commerces => {
        this.commerces = commerces;
        this.sessionService.getCommerceId().subscribe(commerceId => {
          this.commerceId = commerceId || commerces[0].commerceId;
          if (!commerceId) {
            this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
          }
          this.themeService.loadTheme(this.getCommerceResellerName(commerces));
          this.commerceSelected = this.getCommerceNumber(this.commerceId);
          this.searchCustomers();
        });
      },
      error: error => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.commerces'));
        console.error('Error Commerces: ', error);
      }
    });
  }
  
  /**
   * Obtiene la lista de clientes desde la llamada al servicio correspondiente.
   */
  private getCustomers(): void {
    this.emptySearch = true;
    this.loadCompleted = false;
    this.customersService.getCustomers(this.size, this.varSearch).subscribe({
      next: customers => {
        this.customers = customers.data;
        this.emptySearch = this.customers.length === 0;
        this.loadCompleted = true;
      },
      error: () => {
        this.customers = [];
        this.emptySearch = true;
        this.loadCompleted = true;
      }
    });
  }
  
  /**
   * Procesa y agrega clientes desde el contenido de un CSV.
   */
  private processImportedCSV(text: string): void {
    const { rows, errors } = this.parseCSV(text);
    if (errors.length > 0) return;

    const imported = rows.map((row, i) => ({
      clientId: (i + 1).toString(),
      identityDocument: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      address: row[4],
      city: row[5],
      postcode: row[6],
      country: row[7],
      state: row[8]
    } as Customer));

    this.showModal = true;
    this.modalTitle = 'Importación de clientes';
    this.modalMessage = 'Clientes importados correctamente';
    this.customers = [...(this.customers || []), ...imported];
    this.emptySearch = this.customers.length === 0;
  }

  /**
   * Obtiene el ID del comercio correspondiente al número de comercio seleccionado.
   * 
   * @returns El ID del comercio o 0 si no se encuentra.
   */
  private getCommerceId(): number {
    return this.commerces.find(c => c.commerceNumber === this.commerceSelected)?.commerceId ?? 0;
  }

  /**
   * Obtiene el número de comercio correspondiente al ID de comercio especificado.
   * 
   * @param commerceId - ID del comercio.
   * @returns El número de comercio o cadena vacía si no se encuentra.
   */
  private getCommerceNumber(commerceId: number): string {
    return this.commerces.find(c => c.commerceId === commerceId)?.commerceNumber ?? '';
  }

  /**
   * Obtiene el nombre del reseller asociado al comercio activo.
   * 
   * @param commerces - Lista de comercios disponibles.
   * @returns El nombre del reseller o `null` si no se encuentra.
   */
  private getCommerceResellerName(commerces: Commerce[]): string {
    return commerces.find(c => c.commerceId === this.commerceId)?.resellerName ?? null;
  }

  /**
   * Parsea un CSV en filas y columnas.
   */
  private parseCSV(csv: string): { rows: string[][], errors: string[] } {
    const rows: string[][] = [];
    const errors: string[] = [];
    let currentRow: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      if (char === '"') {
        if (insideQuotes && csv[i + 1] === '"') { currentValue += '"'; i++; }
        else { insideQuotes = !insideQuotes; }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentValue); currentValue = '';
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

    const expectedLength = rows[0]?.length ?? 0;
    rows.forEach((row, index) => {
      if (row.length !== expectedLength) {
        errors.push(`Error en la fila ${index + 1}: se esperaban ${expectedLength} columnas pero hay ${row.length}.`);
      }
    });

    return { rows, errors };
  }
}
