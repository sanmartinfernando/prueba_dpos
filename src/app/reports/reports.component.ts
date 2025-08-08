import { StorageService } from 'src/app/_services/storage.service';
import { ArqueoXService } from './../_services/arqueo-x.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { EncryptionService } from '../_services/encryption.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Balance } from '../_models/balance.model';
import { SalesReport, SalesReportAggregations } from '../_models/sales-report.model';
import { SalesReportService } from '../_services/sales-report.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { TerminalsService } from '../_services/terminals.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';


@Component({
  selector: 'app-dpos-reports',
  templateUrl: './reports.component.html',
  styleUrls: [],
})
export class ReportsComponent implements OnInit, OnDestroy {

  private encryptionService = inject(EncryptionService);
  private arqueoXService = inject(ArqueoXService);
  private salesReportService = inject(SalesReportService);
  private storageService = inject(StorageService);
  private downloadCsvService = inject(DownloadCsvService);
  private portalUsersService = inject(PortalUsersService);
  private terminalsService = inject(TerminalsService);
  private commercesService = inject(CommercesService);
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  size = 10000;
  sales: Balance;
  salesReports: SalesReport;
  indexProduct: SalesReportAggregations[];
  page = 0;
  searchParams0 = '';
  loadCompleted = false;
  Math = Math;
  totalUnits = 0;
  totalUnitsValor = 0;
  totalBase = 0;
  totalCuote = 0;
  totalTax = 0;
  totalPercentage = 0;
  totalValuePercentage = 0;

  //Parámetros de búsqueda
  public terminalsNumber: string[];
  terminalSelected: string = null;
  reportVarSearch: string = this.translate.instant('dpos.reports.taxes.label');;
  searchCounter = false;
  sinceDate: string;
  sinceDateMilli = 0;
  tilDate: string;
  tilDateMilli = 0;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  varSearch = '';
  emptySearch = false;
  commerceId = 0;

  currentLang: string;
  langSubscription: Subscription;
  showModal = false;
  modalTitle = '';
  modalMessage = '';


  constructor(
    private themeService: ThemeService,
    public translate: TranslateService,
    private uiStateService: UIStateService
  ) {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));

    //Desbloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(true);

    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
      this.reportVarSearch = this.translate.instant('dpos.reports.taxes.label');
    });
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

    if (this.sessionService.getItem(SessionService.REPORT_TYPE) !== null) {
      this.reportVarSearch = this.getReportVarSearch(this.sessionService.getItem(SessionService.REPORT_TYPE));
    } else {
      this.sessionService.setItem(SessionService.REPORT_TYPE, -1);
      this.reportVarSearch = this.translate.instant('dpos.reports.taxes.label');
    }

    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
          this.authService.setPortalUsersToken(portalUserToken.token);

          this.commercesService.getCommerceList().subscribe({
            next: (commerces) => {
              this.sessionService.getCommerceId().subscribe((commerceId) => {
                if (commerceId !== 0) {
                  this.commerceId = commerceId; // Actualizar el valor en el componente
                } else {
                  this.commerceId = commerces[0].commerceId;
                  this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
                }
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
                    this.searchReports();
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

  //Método de búsqueda
  searchReports() {
    this.loadCompleted = false;

    //Seteamos por defecto el año actual
    const yearDate = new Date(new Date().getFullYear(), 0);
    if (this.sinceDateMilli > 0) {
      this.sinceDateMilli = Date.parse(this.sinceDate);
    } else {
      this.sinceDateMilli = yearDate.getTime();
      this.sinceDate = this.formatDate(this.sinceDateMilli);
      this.sessionService.setItem(SessionService.TO_DATE, this.sinceDateMilli);
    }

    if (this.tilDateMilli > 0) {
      const date = new Date(this.tilDate);
      // Establecer la hora a las 23:59
      date.setHours(23, 59, 0, 0);
      this.tilDateMilli = date.getTime();
    } else {
      this.tilDateMilli = yearDate.getTime() + 31536000000;
      this.tilDate = this.formatDate(this.tilDateMilli);
      this.sessionService.setItem(SessionService.TO_DATE, this.tilDateMilli);
    }

    //Desde fecha
    if (this.sinceDateMilli > 0) {
      if (this.sinceDateMilli > this.tilDateMilli && this.tilDateMilli > 0) {
        this.modalTitle = this.translate.instant('dpos.modal.fromDate.title');
        this.modalMessage = this.translate.instant('dpos.modal.fromDate.message');
        this.openModal();
        return;
      }
    }

    //Hasta fecha
    if (this.tilDateMilli > 0) {
      if (this.tilDateMilli < this.sinceDateMilli && this.sinceDateMilli > 0) {
        this.modalTitle = this.translate.instant('dpos.filter.toDate.title');
        this.modalMessage = this.translate.instant('dpos.filter.toDate.message');
        this.openModal();
        return;
      }
    }

    //Cierre y reseteo de parámetros
    this.varSearch += ']}';
    this.searchCounter = false;
    //Llamada API
    if (this.reportVarSearch === this.translate.instant('dpos.reports.taxes.label') || this.reportVarSearch === this.translate.instant('dpos.reports.paymentmethods.label')) {
      this.getArqueoX();
    } else {//Productos
      this.getSalesReport();
    }
  }

  private getArqueoX() {
    this.loadCompleted = false;
    this.arqueoXService.getArqueoX(this.sinceDateMilli, this.tilDateMilli, this.terminalSelected === this.translate.instant('dpos.filter.all') ? null : this.terminalSelected, this.commerceId).subscribe({
      next: (arqueo) => {
        this.sales = arqueo;
        this.totalBase = 0;
        this.totalCuote = 0;
        this.totalTax = 0;
        this.totalPercentage = 0;
        this.totalValuePercentage = 0;
        if (this.sales !== null && this.sales.balanceLines.length > 0) {
          //Calculo de indicadores totales informes
          for (let i = 0; this.sales.balanceLines !== null && i < this.sales.balanceLines.length; i++) {
            if (this.sales.balanceLines[i].itemType === 1 && this.sales.balanceLines[i].itemValue !== -1) {
              this.totalBase = this.totalBase + this.sales.balanceLines[i].base / Math.pow(10, this.sales.balanceLines[i].decimals);
              this.totalCuote = this.totalCuote + this.sales.balanceLines[i].tax / Math.pow(10, this.sales.balanceLines[i].decimals);
              this.totalTax = this.totalTax + this.sales.balanceLines[i].total / Math.pow(10, this.sales.balanceLines[i].decimals);
            }
            if (
              this.sales.balanceLines[i].itemName.substring(0, 3) === 'Efe' ||
              this.sales.balanceLines[i].itemName.substring(0, 3) === 'Tar' ||
              this.sales.balanceLines[i].itemName.substring(0, 3) === 'Val' ||
              this.sales.balanceLines[i].itemName.substring(0, 3) === 'Vir' ||
              this.sales.balanceLines[i].itemName.substring(0, 3) === 'Otr' ||
              this.sales.balanceLines[i].itemName.substring(0, 3) === 'Bon' ||
              this.sales.balanceLines[i].itemName.substring(0, 3) === 'Rec'
            ) {
              this.totalPercentage = this.totalPercentage + this.sales.balanceLines[i].percentage;
              this.totalValuePercentage = this.totalValuePercentage + this.sales.balanceLines[i].total / Math.pow(10, this.sales.balanceLines[i].decimals);
            }
          }
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      error: (error) => {
        if (error.status === 400 || error.status === 404 || error.status === 401 || error.status === 500) {
          this.emptySearch = true;
          this.loadCompleted = true;
        }
      }
    });
  }

  private getSalesReport() {
    this.loadCompleted = false;
    this.salesReportService.getSalesReport(this.sinceDateMilli, this.tilDateMilli, this.terminalSelected === this.translate.instant('dpos.filter.all') ? null : this.terminalSelected, this.commerceId).subscribe({
      next: (salesReport) => {
        this.salesReports = salesReport;
        this.indexProduct = Object.values(salesReport.aggregations);
        this.totalUnits = 0;
        this.totalUnitsValor = 0;
        if (this.indexProduct !== null && this.indexProduct.length > 0) {
          //Calculo indices totales productos
          for (let i = 0; i < this.indexProduct.length; i++) {
            this.totalUnits = this.totalUnits + (this.indexProduct[i].units ?? 2) / Math.pow(10, 3);
            this.totalUnitsValor = this.totalUnitsValor + this.indexProduct[i].total / Math.pow(10, 8);
          }
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      error: (error) => {
        if (error.status === 400 || error.status === 404 || error.status === 401 || error.status === 500) {
          this.emptySearch = true;
          this.loadCompleted = true;
        }
      }
    });
  }

  //Encriptación
  sendSalesDetails(id: string) {
    let code = this.encryptionService.encryptData(id);
    code = '/details/' + this.encryptionService.encode(code);
  }

  //Boton Descargar
  downloadReports() {
    if (this.reportVarSearch === this.translate.instant('dpos.reports.taxes.label')) {
      this.downloadCsvService.downloadArqueoXFile(this.sales, this.translate.instant('dpos.reports.taxes.label'), this.currentLang);
    } else if (this.reportVarSearch === this.translate.instant('dpos.reports.products.label')) {
      this.downloadCsvService.downloadSalesReportFile(this.salesReports, this.translate.instant('dpos.reports.products.label'), this.currentLang);
    } else if (this.reportVarSearch === this.translate.instant('dpos.reports.paymentmethods.label')) {
      this.downloadCsvService.downloadPaymentMethodsFile(this.sales, this.translate.instant('dpos.reports.paymentmethods.label'), this.currentLang);
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
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

  onReportTypeChange(): void {
    this.sessionService.setItem(SessionService.REPORT_TYPE, this.getReportType());
  }

  // Método para convertir timestamp a formato dd/mm/yyyy
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0'); // Obtener día (con 2 dígitos)
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtener mes (agregar 1 porque getMonth empieza desde 0)
    const year = date.getFullYear(); // Obtener el año
    return `${year}-${month}-${day}`;
  }

  getReportVarSearch(reportType: number): string {
    let reportTypeValue: string = this.translate.instant('dpos.reports.taxes.label');
    if (reportType !== null) {
      switch (reportType) {
        case Balance.REPORT_TYPE_TAXES:
          reportTypeValue = this.translate.instant('dpos.reports.taxes.label');
          break;
        case Balance.REPORT_TYPE_PRODUCTS:
          reportTypeValue = this.translate.instant('dpos.reports.products.label');
          break;
        case Balance.REPORT_TYPE_PM:
          reportTypeValue = this.translate.instant('dpos.reports.paymentmethods.label');
          break;
      }
    }
    return reportTypeValue;
  }

  getReportType(): number {
    let reportType = -1;
    if (this.reportVarSearch !== null) {
      switch (this.reportVarSearch) {
        case this.translate.instant('dpos.reports.taxes.label'):
          reportType = Balance.REPORT_TYPE_TAXES;
          break;
        case this.translate.instant('dpos.reports.products.label'):
          reportType = Balance.REPORT_TYPE_PRODUCTS;
          break;
        case this.translate.instant('dpos.reports.paymentmethods.label'):
          reportType = Balance.REPORT_TYPE_PM;
          break;
      }
    }
    return reportType;
  }
}