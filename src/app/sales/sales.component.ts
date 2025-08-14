import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from './../_services/encryption.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { OrderInfo } from '../_models/order-info.model';
import { PortalUsersService } from '../_services/portal-users.service';
import { TerminalsService } from '../_services/terminals.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';
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
 * Componente encargado de la gestión y visualización de ventas. Proporciona funcionalidades para:
 * - Aplicar y recordar filtros de búsqueda (fechas, comercio, terminal, tipo de operación, documento).
 * - Consultar la información de ventas y calcular totales.
 * - Descargar datos en formato CSV.
 * - Navegar al detalle de una venta con cifrado de identificador.
 */
@Component({
  selector: 'app-dpos-sales',
  templateUrl: './sales.component.html',
})
export class SalesComponent implements OnInit, OnDestroy {

  private encryptionService = inject(EncryptionService);
  private ordersService = inject(OrdersService);
  private downloadCsvService = inject(DownloadCsvService);
  private storageService = inject(StorageService);
  private portalUsersService = inject(PortalUsersService);
  private terminalsService = inject(TerminalsService);
  private commercesService = inject(CommercesService);
  private currencyPipe = inject(CurrencyPipe);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private router = inject(Router);

  size = 10000;
  sales: OrderInfo;
  selectSales = new Array(3);
  salesTicketBai = [];
  operationN: number;
  totalSales = 0;
  totalSalesString: string;
  page = 0;
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
  varSearch = '';
  emptySearch = false;
  modalTitle = '';
  modalMessage = '';

  opTypes: { name: string; value: number }[];

  selectedIndices: number[] = [];
  isAllSelected = false;
  counter = 0;
  currentLang: string;
  langSubscription: Subscription;
  commerceSelected: string;
  commerces: Commerce[];

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.uiStateService.setFormSelectEnabled(true);
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
    });
    this.opTypes = [
      { name: this.translate.instant('dpos.sales.operation.order.label'), value: Order.TYPE_SALE },
      { name: this.translate.instant('dpos.sales.operation.refund.label'), value: Order.TYPE_REFUND },
      { name: this.translate.instant('dpos.sales.operation.rectification.label'), value: Order.TYPE_RECTIFY }
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

    if (this.sessionService.getItem(SessionService.FROM_DATE) !== null) {
      this.sinceDate = this.formatDate(this.sessionService.getItem(SessionService.FROM_DATE));
    }

    if (this.sessionService.getItem(SessionService.TO_DATE) !== null) {
      this.tilDate = this.formatDate(this.sessionService.getItem(SessionService.TO_DATE));
    }

    if (this.sessionService.getItem(SessionService.OP_TYPE) !== null) {
      this.typeVarSearch = this.getTypeVarSearch(this.sessionService.getItem(SessionService.OP_TYPE));
    }
    else {
      this.sessionService.setItem(SessionService.OP_TYPE, -1);
      this.typeVarSearch = this.translate.instant('dpos.filter.all');
    }

    if (this.sessionService.getItem(SessionService.DOC_NUMBER) !== null) {
      this.documentVarSearch = this.sessionService.getItem(SessionService.DOC_NUMBER);
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
                  this.commerceId = commerceId;
                } else {
                  this.commerceId = commerces[0].commerceId;
                  this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
                }
                this.commerceSelected = this.getCommerceNumber(this.commerceId);
                this.terminalsService.getTerminalList().subscribe({
                  next: (terminals) => {
                    terminals = terminals.filter(terminal => terminal.commerceId === this.commerceId && terminal.terminalNumber !== null);
                    if (terminals.length !== 0) {
                      this.terminalsNumber = terminals.map(terminal => terminal.terminalNumber);
                    }
                    this.terminalsNumber.unshift(this.translate.instant('dpos.filter.all'));
                    if (this.sessionService.getItem(SessionService.TERMINAL_NUMBER) === null) {
                      this.terminalSelected = this.terminalsNumber[0];
                      this.sessionService.setItem(SessionService.TERMINAL_NUMBER, this.terminalSelected);
                    } else {
                      this.terminalSelected = this.sessionService.getItem(SessionService.TERMINAL_NUMBER);
                    }
                    this.searchSales();
                  },
                  error: (error) => {
                    console.error("Error Terminals: ", error);
                  }
                });
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

  /**
   * Construye la consulta con los filtros correspondientes y lanza la búsqueda de ventas.
   */
  public searchSales() {

    this.validationVariable = false;
    this.loadCompleted = false;
    if (this.terminalSelected === '' || this.typeVarSearch === '') {
      this.terminalSelected = null;
      this.typeVarSearch = null;
    }

    this.loadCompleted = false;
    this.sinceDateMilli = Date.parse(this.sinceDate);

    const date = new Date(this.tilDate);
    date.setHours(23, 59, 0, 0);
    this.tilDateMilli = date.getTime();

    this.varSearch = "&qs={'and':[";

    if (this.terminalSelected !== null) {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      }
      if (this.terminalSelected === this.translate.instant('dpos.filter.all')) {
        this.varSearch = this.varSearch + "{'or':[";
        for (let i = 1; i < this.terminalsNumber.length; i++) {
          this.varSearch = this.varSearch + "{'field':'terminal_number','op':'=','value':'" + this.terminalsNumber[i] + "'}";
          if (i + 1 < this.terminalsNumber.length) {
            this.varSearch = this.varSearch + ",";
          }
        }
        this.varSearch = this.varSearch + ']}';
      } else {
        this.varSearch = this.varSearch + "{'field':'terminal_number','op':'=','value':'" + this.terminalSelected + "'}";
      }
    }

    if (this.commerceId !== 0) {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch =
        this.varSearch + "{'field':'CommerceId','op':'=','value':'" + this.commerceId + "'}";
    }

    if (this.sinceDateMilli > 0) {
      if (this.sinceDateMilli > this.tilDateMilli && this.tilDateMilli > 0) {
        this.modalTitle = this.translate.instant('dpos.modal.fromDate.title');
        this.modalMessage = this.translate.instant('dpos.modal.fromDate.message');
        return;
      } else {
        if (this.searchCounter === false) {
          this.searchCounter = true;
        } else {
          this.varSearch = this.varSearch + ',';
        }
        this.varSearch = this.varSearch + "{'field':'CreatedAt','op':'>','value':'" + this.sinceDateMilli + "'}";
      }
    }

    if (this.tilDateMilli > 0) {
      if (this.tilDateMilli < this.sinceDateMilli && this.sinceDateMilli > 0) {
        this.modalTitle = this.translate.instant('dpos.filter.toDate.title');
        this.modalMessage = this.translate.instant('dpos.filter.toDate.message');
        return;
      } else {
        if (this.searchCounter === false) {
          this.searchCounter = true;
        } else {
          this.varSearch = this.varSearch + ',';
        }
        this.varSearch = this.varSearch + "{'field':'CreatedAt','op':'<','value':'" + this.tilDateMilli + "'}";
      }
    }

    if (this.typeVarSearch !== null) {
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      if (this.typeVarSearch === this.translate.instant('dpos.filter.all')) {
        this.varSearch = this.varSearch + "{'or':[";
        for (let i = 0; i < this.opTypes.length; i++) {
          if (i === 0) {
            this.varSearch =
              this.varSearch +
              "{'field':'Type','op':'=','value':'" +
              this.opTypes[i].value +
              "'}";
          } else {
            this.varSearch =
              this.varSearch +
              ",{'field':'Type','op':'=','value':'" +
              this.opTypes[i].value +
              "'}";
          }
        }
        this.varSearch = this.varSearch + ']}';
      } else {
        switch (this.typeVarSearch) {
          case this.translate.instant('dpos.sales.operation.order.label'):
            this.selTransTypeVarSearch = 0;
            break;
          case this.translate.instant('dpos.sales.operation.refund.label'):
            this.selTransTypeVarSearch = 2;
            break;
          case this.translate.instant('dpos.sales.operation.rectification.label'):
            this.selTransTypeVarSearch = 5;
        }
        this.varSearch = this.varSearch + "{'field':'Type','op':'=','value':'" + this.selTransTypeVarSearch + "'}";
      }
    }

    if (this.documentVarSearch !== null) {
      if (
        this.documentVarSearch.includes('=') ||
        this.documentVarSearch.includes('(') ||
        this.documentVarSearch.includes(')')
      ) {
        this.validationVariable = true;
        this.loadCompleted = true
        return;
      }
      if (this.searchCounter === false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'Reference','op':'=*.*','value':'" + this.documentVarSearch + "'}";
    }

    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;
    this.getOrderInfo();
  }

  /**
   * Navega al detalle de una venta cifrando y codificando el ID.
   * @param id Identificador de la venta.
   */
  public sendSalesDetails(id: string) {
    const encryptedId = this.encryptionService.encryptData(id);
    const route:string = '/details/' + this.encryptionService.encode(encryptedId);
    this.router.navigate([route]);
  }

  /**
   * Descarga el CSV de ventas.
   */
  public downloadCSV() {
    this.downloadCsvService.downloadSalesFile(this.sales, this.translate.instant('dpos.sales.page.title'), this.currentLang);
  }

  /**
   * Guarda en sesión el terminal seleccionado.
   */
  public onTerminalChange(): void {
    this.sessionService.setItem(SessionService.TERMINAL_NUMBER, this.terminalSelected);
  }

  /**
   * Actualiza y guarda en sesión la fecha "desde".
   */
  public onSinceDateChange(): void {
    this.sessionService.setItem(SessionService.FROM_DATE, this.terminalSelected);
    this.sinceDate = (document.getElementById('sinceDate') as HTMLInputElement).value;
    if (this.sinceDate.length > 0) {
      this.sinceDateMilli = Date.parse(this.sinceDate);
      this.sessionService.setItem(SessionService.FROM_DATE, this.sinceDateMilli);
    }
  }

  /**
   * Actualiza y guarda en sesión la fecha "hasta".
   */
  public onTilDateChange(): void {
    this.sessionService.setItem(SessionService.TO_DATE, this.terminalSelected);
    this.tilDate = (document.getElementById('tilDate') as HTMLInputElement).value;
    if (this.tilDate.length > 0) {
      this.tilDateMilli = Date.parse(this.tilDate);
      this.sessionService.setItem(SessionService.TO_DATE, this.tilDateMilli);
    }
  }

  /**
   * Almacena en sesión el tipo de operación seleccionado.
   */
  public onOpTypeChange(): void {
    this.sessionService.setItem(SessionService.OP_TYPE, this.getOpType());
  }

  /**
   * Almacena en sesión el número de documento introducido.
   */
  public onDocNumberChange(): void {
    this.sessionService.setItem(SessionService.DOC_NUMBER, this.documentVarSearch);
  }

  /**
   * Calcula la base imponible total del array de impuestos de la venta.
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
   * Recupera datos de ventas desde el servicio y calcula totales,
   * listas de selección y estados de TicketBAI/Verifactu.
   */
  private getOrderInfo() {

    this.ordersService.getOrderInfo(this.size, this.varSearch).subscribe(
      (sale) => {
        this.sales = sale;
        if (this.sales.data.length !== 0) {
          this.operationN = this.sales.data.length;
          this.totalSales = 0;
          for (const sale of this.sales.data) {
            if (sale.type === Order.TYPE_SALE) {
              this.totalSales += Number(sale.total);
            } else if (sale.type === Order.TYPE_REFUND) {
              this.totalSales -= Number(sale.total);
            }
          }

          this.totalSalesString = (this.currencyPipe.transform(this.totalSales / (Math.pow(10, 2)), 'EUR', '€') || '');

          for (let i = 0; i < 3; i++) {
            this.selectSales[i] = new Array(this.sales.data.length);
          }

          for (let i = 0; i < this.sales.data.length; i++) {
            let counterSelect = false;
            if (i === 0) {
              this.selectSales[0][i] = this.sales.data[i].terminalNumber;
            } else {
              for (let z = 0; z <= i; z++) {
                if (this.selectSales[0][z] === this.sales.data[i].terminalNumber || counterSelect === true) {
                  counterSelect = true;
                }
                if (counterSelect === false && z === i) {
                  this.selectSales[0][i] = this.sales.data[i].terminalNumber;
                }
              }
              counterSelect = false;
            }

            if (i === 0) {
              this.selectSales[1][i] = this.sales.data[i].type;
            } else {
              for (let z = 0; z <= i; z++) {
                if (this.selectSales[1][z] === this.sales.data[i].type || counterSelect === true) {
                  counterSelect = true;
                }
                if (counterSelect === false && z === i) {
                  this.selectSales[1][i] = this.sales.data[i].type;
                }
              }
              counterSelect = false;
            }

            if (i === 0) {
              this.selectSales[2][i] = this.sales.data[i].reference;
            } else {
              for (let z = 0; z <= i; z++) {
                if (this.selectSales[2][z] === this.sales.data[i].reference || counterSelect === true) {
                  counterSelect = true;
                }

                if (counterSelect === false && z === i) {
                  this.selectSales[2][i] = this.sales.data[i].reference;
                }
              }
              counterSelect = false;
            }
          }

          for (let i = this.sales.data.length - 1; i >= 0; i--) {
            if (this.selectSales[0][i] === null) {
              this.selectSales[0].splice(i, 1);
            }
          }
          for (let i = this.sales.data.length - 1; i >= 0; i--) {
            if (this.selectSales[1][i] === null) {
              this.selectSales[1].splice(i, 1);
            }
          }
          for (let i = this.sales.data.length - 1; i >= 0; i--) {
            if (this.selectSales[2][i] === null) {
              this.selectSales[2].splice(i, 1);
            }
          }
          for (let i = this.selectSales[1].length; i >= 0; i--) {
            this.translatedTypeVarSearch[i] = this.selectSales[1][i];
            switch (this.selectSales[1][i]) {
              case 0:
                this.selectSales[1][i] = this.translate.instant('dpos.sales.operation.order.label');
                break;
              case 2:
                this.selectSales[1][i] = this.translate.instant('dpos.sales.operation.refund.label');
                break;
              case 5:
                this.selectSales[1][i] = this.translate.instant('dpos.sales.operation.rectification.label');
            }
          }

          this.salesTicketBai = []
          for (let i = 0; i <= this.sales.data.length; i++) {
            if (this.sales.data[i] != null && this.sales.data[i].orderTicketBai != null) {
              if (this.sales.data[i].orderTicketBai.status === '00' && this.sales.data[i].orderTicketBai.warns.length <= 0) {
                this.salesTicketBai[i] = 0
              }
              if (this.sales.data[i].orderTicketBai.status === '00' && this.sales.data[i].orderTicketBai.warns.length > 0) {
                this.salesTicketBai[i] = 1
              }
              if (this.sales.data[i].orderTicketBai.status === '01') {
                this.salesTicketBai[i] = 2
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
   * @param opType Identificador numérico del tipo de operación.
   * @returns Cadena traducida para el selector.
   */
  private getTypeVarSearch(opType: number): string {
    let opTypeValue: string = this.translate.instant('dpos.filter.all');
    if (opType !== null) {
      switch (opType) {
        case Order.TYPE_SALE:
          opTypeValue = this.translate.instant('dpos.sales.operation.order.label');
          break;
        case Order.TYPE_REFUND:
          opTypeValue = this.translate.instant('dpos.sales.operation.refund.label');
          break;
        case Order.TYPE_RECTIFY:
          opTypeValue = this.translate.instant('dpos.sales.operation.rectification.label');
          break;
      }
    }
    return opTypeValue;
  }

  /**
   * Traduce el valor seleccionado en el selector, a su código numérico.
   * @returns Código del tipo de operación, o -1 si no aplica.
   */
  private getOpType(): number {
    let opType = -1;
    if (this.typeVarSearch !== null) {
      switch (this.typeVarSearch) {
        case this.translate.instant('dpos.sales.operation.order.label'):
          opType = Order.TYPE_SALE;
          break;
        case this.translate.instant('dpos.sales.operation.refund.label'):
          opType = Order.TYPE_REFUND;
          break;
        case this.translate.instant('dpos.sales.operation.rectification.label'):
          opType = Order.TYPE_RECTIFY;
          break;
      }
    }
    return opType;
  }

  /**
   * Obtiene el número de comercio a partir de su ID.
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
}