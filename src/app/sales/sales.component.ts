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

  //Parámetros de búsqueda
  public terminalsNumber: string[];
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
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  public opTypes: { name: string; value: number }[];

  // Checkboxes
  selectedIndices: number[] = [];
  isAllSelected = false;
  counter = 0;
  currentLang: string;
  langSubscription: Subscription;
  commerceSelected: string;
  commerces: Commerce[];

  constructor() {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));

    //Desbloqueamos el selector de comercio;
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

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

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
                  this.commerceId = commerceId; // Actualizar el valor en el componente
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

  searchSales() {
    this.validationVariable = false;
    this.loadCompleted = false;
    if (this.terminalSelected === '' || this.typeVarSearch === '') {
      this.terminalSelected = null;
      this.typeVarSearch = null;
    }
    //Obtención variables fechas
    this.loadCompleted = false;
    this.sinceDateMilli = Date.parse(this.sinceDate);

    const date = new Date(this.tilDate);
    date.setHours(23, 59, 0, 0);
    this.tilDateMilli = date.getTime();

    //Comienzo query búsqueda
    this.varSearch = "&qs={'and':[";

    //Parámetros de búsqueda activos
    //Terminal
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

    //Desde fecha
    if (this.sinceDateMilli > 0) {
      if (this.sinceDateMilli > this.tilDateMilli && this.tilDateMilli > 0) {
        this.modalTitle = this.translate.instant('dpos.modal.fromDate.title');
        this.modalMessage = this.translate.instant('dpos.modal.fromDate.message');
        this.openModal();
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

    //Hasta fecha
    if (this.tilDateMilli > 0) {
      if (this.tilDateMilli < this.sinceDateMilli && this.sinceDateMilli > 0) {
        this.modalTitle = this.translate.instant('dpos.filter.toDate.title');
        this.modalMessage = this.translate.instant('dpos.filter.toDate.message');
        this.openModal();
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

    //Tipo de operación
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
    //Nº de Documento
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

  getOrderInfo() {
    this.ordersService.getOrderInfo(this.size, this.varSearch).subscribe(
      (sale) => {
        this.sales = sale;
        if (this.sales.data.length !== 0) {
          this.operationN = this.sales.data.length;

          this.totalSales = 0;
          for (const sale of this.sales.data) {
            if (sale.type === 0) { // Ventas
              this.totalSales += Number(sale.total);
            } else if (sale.type === 2) { // Devoluciones
              this.totalSales -= Number(sale.total);
            }
          }
          this.totalSalesString = (this.currencyPipe.transform(this.totalSales / (Math.pow(10, 2)), 'EUR', '€') || '');

          for (let i = 0; i < 3; i++) {
            this.selectSales[i] = new Array(this.sales.data.length);
          }

          //Creación de arrays del select del formulario de búsqueda
          //Terminal
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
            //Tipo de operación
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
            //Nº de documento
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
          //Eliminación espacios en blanco de arrays
          //Terminal
          for (let i = this.sales.data.length - 1; i >= 0; i--) {
            if (this.selectSales[0][i] === null) {
              this.selectSales[0].splice(i, 1);
            }
          }
          //Tipo de operación
          for (let i = this.sales.data.length - 1; i >= 0; i--) {
            if (this.selectSales[1][i] === null) {
              this.selectSales[1].splice(i, 1);
            }
          }
          //Nº de documento
          for (let i = this.sales.data.length - 1; i >= 0; i--) {
            if (this.selectSales[2][i] === null) {
              this.selectSales[2].splice(i, 1);
            }
          }
          //Traducción tipo de operación
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

  //Encriptación
  sendSalesDetails(id: string) {
    const encryptedId = this.encryptionService.encryptData(id);
    const route:string = '/details/' + this.encryptionService.encode(encryptedId);
    this.router.navigate([route]);
  }

  //Boton Descargar
  downloadCSV() {
    this.downloadCsvService.downloadSalesFile(this.sales, this.translate.instant('dpos.sales.page.title'), this.currentLang);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onCommerceChange(): void {
    this.commerceId = this.getCommerceId();
    this.terminalsService.getTerminalList().subscribe({
      next: (terminals) => {
        terminals = terminals.filter(terminal => terminal.commerceId === this.commerceId && terminal.terminalNumber !== null);
        if (terminals.length !== 0) {
          this.terminalsNumber = terminals.map(terminal => terminal.terminalNumber);
        }
        this.terminalsNumber.unshift(this.translate.instant('dpos.filter.all'));
        this.terminalSelected = this.terminalsNumber[0];
      },
      error: (error) => {
        console.error("Error Terminals: ", error);
      }
    });
  }

  onTerminalChange(): void {
    this.sessionService.setItem(SessionService.TERMINAL_NUMBER, this.terminalSelected);
  }

  onSinceDateChange(): void {
    this.sessionService.setItem(SessionService.FROM_DATE, this.terminalSelected);
    this.sinceDate = (document.getElementById('sinceDate') as HTMLInputElement).value;
    if (this.sinceDate.length > 0) {
      this.sinceDateMilli = Date.parse(this.sinceDate);
      this.sessionService.setItem(SessionService.FROM_DATE, this.sinceDateMilli);
    }
  }

  onTilDateChange(): void {
    this.sessionService.setItem(SessionService.TO_DATE, this.terminalSelected);
    this.tilDate = (document.getElementById('tilDate') as HTMLInputElement).value;
    if (this.tilDate.length > 0) {
      this.tilDateMilli = Date.parse(this.tilDate);
      this.sessionService.setItem(SessionService.TO_DATE, this.tilDateMilli);
    }
  }

  onOpTypeChange(): void {
    this.sessionService.setItem(SessionService.OP_TYPE, this.getOpType());
  }

  onDocNumberChange(): void {
    this.sessionService.setItem(SessionService.DOC_NUMBER, this.documentVarSearch);
  }

  getTypeVarSearch(opType: number): string {
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

  getOpType(): number {
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

  getCommerceId(): number {
    const commerce = this.commerces.find(commerce => commerce.commerceNumber === this.commerceSelected);
    if (commerce !== undefined) {
      return commerce.commerceId;
    }
    return 0;
  }

  getTotalBase(orderTaxes: OrderTax[]): number {
    if (orderTaxes !== undefined) {
      let totalBase = 0;
      for (const tax of orderTaxes) {
        totalBase += tax.base / Math.pow(10, tax.decimals);
      }
      return totalBase;
    }
    return 0;
  }

  getTotalTaxes(orderTaxes: OrderTax[]): number {
    if (orderTaxes !== undefined) {
      let totalTaxes = 0;
      for (const tax of orderTaxes) {
        totalTaxes += tax.total / Math.pow(10, tax.decimals);
      }
      return totalTaxes;
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

  // Método para convertir timestamp a formato dd/mm/yyyy
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
