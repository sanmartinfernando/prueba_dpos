import { EncryptionService } from '../_services/encryption.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { OrderInfo } from '../_models/order-info.model';
import { TerminalsService } from '../_services/terminals.service';
import { CommercesService } from '../_services/commerces.service';
import { OrdersService } from '../_services/orders.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Order } from '../_models/order.model';
import { CurrencyPipe } from '@angular/common';
import { Commerce } from '../_models/commerce.model';
import { SessionService } from '../_services/session.service';
import { VerifactuStatus } from '../_models/order-verifactu.model';
import { OrderTax } from '../_models/order-tax.model';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { Router } from '@angular/router';

/**
 * @class OperationsComponent
 * @description
 * Componente encargado de la gestión y visualización de ventas. Proporciona funcionalidades para:
 * - Aplicar y recordar filtros de búsqueda (fechas, comercio, terminal, tipo de operación, documento).
 * - Consultar la información de ventas y calcular totales.
 * - Descargar datos en formato CSV.
 * - Navegar al detalle de una venta con cifrado de identificador.
 */
@Component({
  selector: 'app-dpos-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit, OnDestroy {

  private encryptionService = inject(EncryptionService);
  private ordersService = inject(OrdersService);
  private downloadCsvService = inject(DownloadCsvService);
  private terminalsService = inject(TerminalsService);
  private commercesService = inject(CommercesService);
  private currencyPipe = inject(CurrencyPipe);
  private sessionService = inject(SessionService);
  private translate = inject(TranslateService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private router = inject(Router);

  size = 10000;
  operations: OrderInfo;
  selectoperations = new Array(3);
  operationsTicketBai = [];
  operationN: number;
  totaloperations = 0;
  totaloperationsString: string;
  page = 0;
  itemsPerPage: number = 10
  loadCompleted = false;
  isLoggedIn = true;
  Math = Math;
  validationVariable = false;
  commerceId = 0;
  verifactuStatus = VerifactuStatus;

  terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter = false;
  sinceDate: string;
  sinceDateMilli: number;
  tilDate: string;
  tilDateMilli: number;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  typeVarSearch: string = null;
  translatedTypeVarSearch = new Array(3);
  selTransTypeVarSearch: number = null;
  documentVarSearch: string = null;
  emptySearch = false;

  opTypes: { name: string; value: number }[];

  selectedIndices: number[] = [];
  isAllSelected = false;
  counter = 0;
  currentLang: string;
  langSubscription: Subscription;
  commerceSelected: string;
  commerces: Commerce[];

  modalTitle = '';
  modalMessage = '';
  showModal = false;

  isComercia = false;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));

    this.uiStateService.setFormSelectEnabled(true);
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
    });
    this.opTypes = [
      { name: this.translate.instant('dpos.operations.operation.order.label'), value: Order.TYPE_SALE },
      { name: this.translate.instant('dpos.operations.operation.refund.label'), value: Order.TYPE_REFUND },
      { name: this.translate.instant('dpos.operations.operation.rectification.label'), value: Order.TYPE_RECTIFY }
    ];
  }

  /**
   * Se ejecuta al destruir el componente.
   * Libera la suscripción a cambios de idioma.
   */
  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  /**
   * Inicializa filtros desde sesión, establece valores por defecto 
   * y carga comercios/terminales para buscar ventas.
   */
  ngOnInit(): void {
    this.loadCompleted = false;




    this.commercesService.getCommerceList().subscribe({
      next: (commerces) => {
        this.commerces = commerces;
        this.sessionService.getCommerceId().subscribe((commerceId) => {
          if (commerceId !== 0) {
            this.commerceId = commerceId;
          } else {
            this.commerceId = commerces[0].commerceId;
            this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
          }
          this.isComercia = this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
          this.commerceSelected = this.getCommerceNumber(this.commerceId);
          this.terminalsService.getTerminalList().subscribe({
            next: (terminals) => {
              terminals = terminals.filter(terminal => terminal.commerceId === this.commerceId && terminal.terminalNumber !== null);
              if (terminals.length !== 0) {
                this.terminalsNumber = terminals.map(terminal => terminal.terminalNumber);
              }
              this.terminalsNumber.unshift(this.translate.instant('dpos.filter.all'));
              if (this.terminalSelected === null) {
                this.terminalSelected = this.terminalsNumber[0];

              } else {
                this.terminalSelected = this.terminalsNumber[0];
              }
              this.searchoperations();
            },
            error: (error) => {
              this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.terminals'));
              console.error("Error Terminals: ", error);
            }
          });
        });
      },
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.commerces'));
        console.error("Error Commerces: ", error);
      }
    });
  }

  /**
   * Construye la consulta con los filtros correspondientes y lanza la búsqueda de ventas.
   */
  public searchoperations() {
    this.validationVariable = false;
    this.loadCompleted = false;

    if (this.terminalSelected === '' || this.typeVarSearch === '') {
      this.terminalSelected = null;
      this.typeVarSearch = null;
    }

    this.sinceDateMilli = Date.parse(this.sinceDate);
    const date = new Date(this.tilDate);
    date.setHours(23, 59, 0, 0);
    this.tilDateMilli = date.getTime();

    const andFilters: any[] = [];

    if (this.terminalSelected !== null) {
      if (this.terminalSelected === this.translate.instant('dpos.filter.all')) {
        const orFilters = this.terminalsNumber.slice(1).map(t => ({
          field: 'terminal_number',
          op: '=',
          value: t
        }));
        andFilters.push({ or: orFilters });
      } else {
        andFilters.push({ field: 'terminal_number', op: '=', value: this.terminalSelected });
      }
    }

    if (this.commerceId !== 0) {
      andFilters.push({ field: 'CommerceId', op: '=', value: this.commerceId });
    }

    if (this.sinceDateMilli > 0) {
      if (this.sinceDateMilli > this.tilDateMilli && this.tilDateMilli > 0) {
        this.openModal(
          this.translate.instant('dpos.modal.fromDate.title'),
          this.translate.instant('dpos.modal.fromDate.message')
        );
        return;
      }
      andFilters.push({ field: 'CreatedAt', op: '>', value: this.sinceDateMilli });
    }

    if (this.tilDateMilli > 0) {
      if (this.tilDateMilli < this.sinceDateMilli && this.sinceDateMilli > 0) {
        this.openModal(
          this.translate.instant('dpos.filter.toDate.title'),
          this.translate.instant('dpos.filter.toDate.message')
        );
        return;
      }
      andFilters.push({ field: 'CreatedAt', op: '<', value: this.tilDateMilli });
    }

    if (this.typeVarSearch !== null) {
      if (this.typeVarSearch != this.translate.instant('dpos.filter.all')) {
        switch (this.typeVarSearch) {
          case this.translate.instant('dpos.operations.operation.order.label'):
            this.selTransTypeVarSearch = 0;
            break;
          case this.translate.instant('dpos.operations.operation.refund.label'):
            this.selTransTypeVarSearch = 2;
            break;
          case this.translate.instant('dpos.operations.operation.rectification.label'):
            this.selTransTypeVarSearch = 5;
        }
        andFilters.push({ field: 'Type', op: '=', value: this.selTransTypeVarSearch });
      }
    }

    if (this.documentVarSearch !== null) {
      if (
        this.documentVarSearch.includes('=') ||
        this.documentVarSearch.includes('(') ||
        this.documentVarSearch.includes(')')
      ) {
        this.validationVariable = true;
        this.loadCompleted = true;
        return;
      }
      andFilters.push({ field: 'Reference', op: '=*.*', value: this.documentVarSearch });
    }

    const qsObject = { and: andFilters };
    const qsString = JSON.stringify(qsObject);
    this.getOrderInfo(qsString);
  }

  /**
* Resetea los filtros de búsqueda a sus valores por defecto.
*/
  public resetReports() {

    this.sinceDate = '';
    this.sinceDateMilli = null;
    this.tilDate = '';
    this.tilDateMilli = null;

    this.terminalSelected = this.terminalsNumber[0];
    this.typeVarSearch = this.translate.instant('dpos.filter.all');
    this.documentVarSearch = null;
    this.searchoperations();

  }

  /**
   * Navega al detalle de una venta cifrando y codificando el ID.
   * 
   * @param id Identificador de la venta.
   */
  public sendoperationsDetails(id: string) {
    const encryptedId = this.encryptionService.encryptData(id);
    const route: string = '/details/' + this.encryptionService.encode(encryptedId);
    this.router.navigate([route]);
  }

  /**
   * Descarga el CSV de ventas.
   */
  public downloadCSV() {
    this.downloadCsvService.downloadOperationsFile(this.operations, this.translate.instant('dpos.operations.page.title'), this.currentLang);
  }


  /**
   * Actualiza y guarda en sesión la fecha "desde".
   */
  public onSinceDateChange(): void {

    this.sinceDate = (document.getElementById('sinceDate') as HTMLInputElement).value;
    if (this.sinceDate.length > 0) {
      this.sinceDateMilli = Date.parse(this.sinceDate);
    }
  }

  /**
   * Actualiza y guarda en sesión la fecha "hasta".
   */
  public onTilDateChange(): void {
    this.tilDate = (document.getElementById('tilDate') as HTMLInputElement).value;
    if (this.tilDate.length > 0) {
      this.tilDateMilli = Date.parse(this.tilDate);
    }
  }




  /**
   * Calcula la base imponible total del array de impuestos de la venta.
   * 
   * @param orderTaxes Lista de impuestos de la venta.
   * @returns Total de la base imponible.
   */
  public getTotalBase(orderTaxes: OrderTax[]): number {
    if (orderTaxes !== undefined) {
      let totalBase = 0;
      for (const tax of orderTaxes) {
        totalBase += tax.base / Math.pow(10, tax.decimals);
      }
      return totalBase;
    }
    return 0;
  }

  /**
   * Calcula el total de impuestos del array de impuestos de la venta.
   * 
   * @param orderTaxes Lista de impuestos de la venta.
   * @returns Total de impuestos.
   */
  public getTotalTaxes(orderTaxes: OrderTax[]): number {
    if (orderTaxes !== undefined) {
      let totalTaxes = 0;
      for (const tax of orderTaxes) {
        totalTaxes += tax.total / Math.pow(10, tax.decimals);
      }
      return totalTaxes;
    }
    return 0;
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
  }

  /**
   * Recupera datos de ventas desde el servicio y calcula totales,
   * listas de selección y estados de TicketBAI/Verifactu.
   */
  private getOrderInfo(qsString: string) {
    this.ordersService.getOrderInfo(this.size, qsString).subscribe(
      (operation) => {
        this.operations = operation;
        if (this.operations.data.length !== 0) {
          this.operationN = this.operations.data.length;
          this.totaloperations = 0;
          for (const operation of this.operations.data) {
            if (operation.type === Order.TYPE_SALE) {
              this.totaloperations += Number(operation.total);
            } else if (operation.type === Order.TYPE_REFUND) {
              this.totaloperations -= Number(operation.total);
            }
          }

          this.totaloperationsString = (this.currencyPipe.transform(this.totaloperations / (Math.pow(10, 2)), 'EUR', '€') || '');

          for (let i = 0; i < 3; i++) {
            this.selectoperations[i] = new Array(this.operations.data.length);
          }

          for (let i = 0; i < this.operations.data.length; i++) {
            let counterSelect = false;
            if (i === 0) {
              this.selectoperations[0][i] = this.operations.data[i].terminalNumber;
            } else {
              for (let z = 0; z <= i; z++) {
                if (this.selectoperations[0][z] === this.operations.data[i].terminalNumber || counterSelect === true) {
                  counterSelect = true;
                }
                if (counterSelect === false && z === i) {
                  this.selectoperations[0][i] = this.operations.data[i].terminalNumber;
                }
              }
              counterSelect = false;
            }

            if (i === 0) {
              this.selectoperations[1][i] = this.operations.data[i].type;
            } else {
              for (let z = 0; z <= i; z++) {
                if (this.selectoperations[1][z] === this.operations.data[i].type || counterSelect === true) {
                  counterSelect = true;
                }
                if (counterSelect === false && z === i) {
                  this.selectoperations[1][i] = this.operations.data[i].type;
                }
              }
              counterSelect = false;
            }

            if (i === 0) {
              this.selectoperations[2][i] = this.operations.data[i].reference;
            } else {
              for (let z = 0; z <= i; z++) {
                if (this.selectoperations[2][z] === this.operations.data[i].reference || counterSelect === true) {
                  counterSelect = true;
                }

                if (counterSelect === false && z === i) {
                  this.selectoperations[2][i] = this.operations.data[i].reference;
                }
              }
              counterSelect = false;
            }
          }

          for (let i = this.operations.data.length - 1; i >= 0; i--) {
            if (this.selectoperations[0][i] === null) {
              this.selectoperations[0].splice(i, 1);
            }
          }
          for (let i = this.operations.data.length - 1; i >= 0; i--) {
            if (this.selectoperations[1][i] === null) {
              this.selectoperations[1].splice(i, 1);
            }
          }
          for (let i = this.operations.data.length - 1; i >= 0; i--) {
            if (this.selectoperations[2][i] === null) {
              this.selectoperations[2].splice(i, 1);
            }
          }
          for (let i = this.selectoperations[1].length; i >= 0; i--) {
            this.translatedTypeVarSearch[i] = this.selectoperations[1][i];
            switch (this.selectoperations[1][i]) {
              case 0:
                this.selectoperations[1][i] = this.translate.instant('dpos.operations.operation.order.label');
                break;
              case 2:
                this.selectoperations[1][i] = this.translate.instant('dpos.operations.operation.refund.label');
                break;
              case 5:
                this.selectoperations[1][i] = this.translate.instant('dpos.operations.operation.rectification.label');
            }
          }

          this.operationsTicketBai = []
          for (let i = 0; i <= this.operations.data.length; i++) {
            if (this.operations.data[i] != null && this.operations.data[i].orderTicketBai != null) {
              if (this.operations.data[i].orderTicketBai.status === '00' && this.operations.data[i].orderTicketBai.warns.length <= 0) {
                this.operationsTicketBai[i] = 0
              }
              if (this.operations.data[i].orderTicketBai.status === '00' && this.operations.data[i].orderTicketBai.warns.length > 0) {
                this.operationsTicketBai[i] = 1
              }
              if (this.operations.data[i].orderTicketBai.status === '01') {
                this.operationsTicketBai[i] = 2
              }
            }
          }
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      (error) => {
        if (error.status === 401 || error.status === 500) {
          this.emptySearch = true;
          this.loadCompleted = true;
        };
      }
    );
  }

  /**
   * Obtiene el texto traducido del tipo de operación.
   * 
   * @param opType Identificador numérico del tipo de operación.
   * @returns Cadena traducida para el selector.
   */
  private getTypeVarSearch(opType: number): string {
    let opTypeValue: string = this.translate.instant('dpos.filter.all');
    if (opType !== null) {
      switch (opType) {
        case Order.TYPE_SALE:
          opTypeValue = this.translate.instant('dpos.operations.operation.order.label');
          break;
        case Order.TYPE_REFUND:
          opTypeValue = this.translate.instant('dpos.operations.operation.refund.label');
          break;
        case Order.TYPE_RECTIFY:
          opTypeValue = this.translate.instant('dpos.operations.operation.rectification.label');
          break;
      }
    }
    return opTypeValue;
  }

  /**
   * Traduce el valor seleccionado en el selector, a su código numérico.
   * 
   * @returns Código del tipo de operación, o -1 si no aplica.
   */
  private getOpType(): number {
    let opType = -1;
    if (this.typeVarSearch !== null) {
      switch (this.typeVarSearch) {
        case this.translate.instant('dpos.operations.operation.order.label'):
          opType = Order.TYPE_SALE;
          break;
        case this.translate.instant('dpos.operations.operation.refund.label'):
          opType = Order.TYPE_REFUND;
          break;
        case this.translate.instant('dpos.operations.operation.rectification.label'):
          opType = Order.TYPE_RECTIFY;
          break;
      }
    }
    return opType;
  }

  /**
   * Obtiene el número de comercio a partir de su ID.
   * 
   * @param commerceId Identificador del comercio.
   * @returns Número de comercio o cadena vacía si no existe.
   */
  private getCommerceNumber(commerceId: number): string {
    const commerce = this.commerces.find(commerce => commerce.commerceId === commerceId);
    if (commerce !== undefined) {
      return commerce.commerceNumber;
    }
    return "";
  }

  /**
   * Formatea un timestamp a 'YYYY-MM-DD'.
   * 
   * @param timestamp Milisegundos.
   * @returns Fecha formateada como string.
   */
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }



  /**
   * Ordena la tabla en base a las columnas.
   * 
   * @returns la tabla ordenada o 0 si no hay cambios.
   */
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    const getValue = (obj: any, path: string) => {
      // soporta propiedades anidadas, ej: 'orderVerifactu.status'
      return path.split('.').reduce((o, key) => (o ? o[key] : null), obj);
    };

    this.operations.data.sort((a: any, b: any) => {
      let valA: any;
      let valB: any;

      switch (column) {
        case 'totalBase':
          valA = this.getTotalBase(a.orderTaxes);
          valB = this.getTotalBase(b.orderTaxes);
          break;
        case 'totalTaxes':
          valA = this.getTotalTaxes(a.orderTaxes);
          valB = this.getTotalTaxes(b.orderTaxes);
          break;
        case 'total':
          valA = a.total / Math.pow(10, a.decimals);
          valB = b.total / Math.pow(10, b.decimals);
          break;
        default:
          valA = getValue(a, column);
          valB = getValue(b, column);
      }

      // Normalizar nulos
      if (valA == null) valA = '';
      if (valB == null) valB = '';

      // Números
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // Strings
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      // Boolean
      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return this.sortDirection === 'asc'
          ? Number(valA) - Number(valB)
          : Number(valB) - Number(valA);
      }

      // Fechas
      if (valA instanceof Date && valB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }

      return 0;
    });
  }





}