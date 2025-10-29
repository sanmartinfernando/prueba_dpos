import { ArqueoXService } from './../_services/arqueo-x.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Balance } from '../_models/balance.model';

import { TerminalsService } from '../_services/terminals.service';
import { CommercesService } from '../_services/commerces.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { Commerce } from '../_models/commerce.model';
import { OperationsReportService } from '../_services/sales-report.service';
import { OperationsReport, OperationsReportAggregations } from '../_models/operations-report.model';

/**
 * @class ReportsComponent
 * @description
 * Componente encargado de gestionar y mostrar informes.
 * Permite filtrar por fechas, terminales y tipo de informe, así como descargar resultados en CSV.
 */
@Component({
  selector: 'app-dpos-reports',
  templateUrl: './reports.component.html',
  styleUrls: [],
})
export class ReportsComponent implements OnInit, OnDestroy {

  private arqueoXService = inject(ArqueoXService);
  private operationsReportService = inject(OperationsReportService);
  private downloadCsvService = inject(DownloadCsvService);
  private terminalsService = inject(TerminalsService);
  private commercesService = inject(CommercesService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  public translate = inject(TranslateService);
  private uiStateService = inject(UIStateService);

  size = 10000;
  operations: Balance;
  operationsReports: OperationsReport;
  indexProduct: OperationsReportAggregations[];
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

  terminalsNumber: string[];
  terminalSelected: string = null;
  reportVarSearch: string = this.translate.instant('dpos.reports.taxes.label');
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

  isComercia = false;


  /**
   * Constructor del componente.
   * Inicializa el tema, el estado de la UI y la suscripción a cambios de idioma.
   */
  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.uiStateService.setFormSelectEnabled(true);
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
      this.reportVarSearch = this.translate.instant('dpos.reports.taxes.label');
    });
  }

  /**
   * Método que se ejecuta al destruirse el componente, cancelando la suscripción a cambios de idioma.
   */
  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  /**
   * Inicializa datos de fechas, tipo de informe, terminales y comercios.
   */
  ngOnInit(): void {
    this.loadCompleted = false;


    this.commercesService.getCommerceList().subscribe({
      next: (commerces) => {
        this.sessionService.getCommerceId().subscribe((commerceId) => {
          if (commerceId !== 0) {
            this.commerceId = commerceId;
          } else {
            this.commerceId = commerces[0].commerceId;
            this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
          }
          this.isComercia = this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
          this.terminalsService.getTerminalList().subscribe({
            next: (terminals) => {
              const filteredTerminals = terminals.filter(terminal =>
                terminal.commerceId === this.commerceId && terminal.terminalNumber !== null
              );

              this.terminalsNumber = filteredTerminals.map(terminal => terminal.terminalNumber);

              this.terminalsNumber.unshift(this.translate.instant('dpos.filter.all'));

              if (this.sessionService.getItem(SessionService.TERMINAL_NUMBER) === null) {
                this.terminalSelected = this.terminalsNumber[0];
                this.sessionService.setItem(SessionService.TERMINAL_NUMBER, this.terminalSelected);
              } else {
                const storedTerminal = this.sessionService.getItem(SessionService.TERMINAL_NUMBER);
                if (this.terminalsNumber.includes(storedTerminal)) {
                  this.terminalSelected = storedTerminal;
                } else {
                  this.terminalSelected = this.terminalsNumber[0]; // Selecciona 'Todas'
                }
              }

              this.searchReports();
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
   * Lleva a cabo la búsqueda de informes según los parámetros de fecha, terminal y tipo.
   * Valida rangos de fecha y decide qué tipo de informe cargar.
   */
  public searchReports() {

    this.loadCompleted = false;
    const yearDate = new Date(new Date().getFullYear(), 0);
    if (this.sinceDateMilli > 0) {
      this.sinceDateMilli = Date.parse(this.sinceDate);
    } else {
      this.sinceDateMilli = yearDate.getTime();
      this.sinceDate = this.formatDate(this.sinceDateMilli);
    }

    if (this.tilDateMilli > 0) {
      const date = new Date(this.tilDate);
      date.setHours(23, 59, 0, 0);
      this.tilDateMilli = date.getTime();
    } else {
      this.tilDateMilli = yearDate.getTime() + 31536000000;
      this.tilDate = this.formatDate(this.tilDateMilli);
    }

    if (this.sinceDateMilli > 0) {
      if (this.sinceDateMilli > this.tilDateMilli && this.tilDateMilli > 0) {
        this.openModal(this.translate.instant('dpos.modal.fromDate.title'), this.translate.instant('dpos.modal.fromDate.message'));
        return;
      }
    }

    if (this.tilDateMilli > 0) {
      if (this.tilDateMilli < this.sinceDateMilli && this.sinceDateMilli > 0) {
        this.openModal(this.translate.instant('dpos.filter.toDate.title'), this.translate.instant('dpos.filter.toDate.message'));
        return;
      }
    }

    this.varSearch += ']}';
    this.searchCounter = false;
    if (this.reportVarSearch === this.translate.instant('dpos.reports.taxes.label') || this.reportVarSearch === this.translate.instant('dpos.reports.paymentmethods.label')) {
      this.getArqueoX();
    } else {
      this.getOperationsReport();
    }
  }

  /**
    * Resetea los filtros de búsqueda a sus valores por defecto.
    */
  public resetReports() {
    this.reportVarSearch = this.translate.instant('dpos.reports.taxes.label');
    this.terminalSelected = this.terminalsNumber[0];
    const yearDate = new Date(new Date().getFullYear(), 0);
    this.tilDateMilli = yearDate.getTime() + 31536000000;
    this.tilDate = this.formatDate(this.tilDateMilli);
    this.getArqueoX();
  }


  /**
   * Descarga el informe actual en formato CSV según el tipo de informe.
   */
  public downloadReports() {
    if (this.reportVarSearch === this.translate.instant('dpos.reports.taxes.label')) {
      this.downloadCsvService.downloadArqueoXFile(this.operations, this.translate.instant('dpos.reports.taxes.label'), this.currentLang);
    } else if (this.reportVarSearch === this.translate.instant('dpos.reports.products.label')) {
      this.downloadCsvService.downloadOperationsReportFile(this.operationsReports, this.translate.instant('dpos.reports.products.label'), this.currentLang);
    } else if (this.reportVarSearch === this.translate.instant('dpos.reports.paymentmethods.label')) {
      this.downloadCsvService.downloadPaymentMethodsFile(this.operations, this.translate.instant('dpos.reports.paymentmethods.label'), this.currentLang);
    }
  }


  /**
   * Evento al cambiar la fecha inicial.
   * Actualiza la fecha en la sesión y la almacena en milisegundos.
   */
  public onSinceDateChange(): void {
    this.sinceDate = (document.getElementById('sinceDate') as HTMLInputElement).value;
    if (this.sinceDate.length > 0) {
      this.sinceDateMilli = Date.parse(this.sinceDate);

    }
  }

  /**
   * Evento al cambiar la fecha final.
   * Actualiza la fecha en la sesión y la almacena en milisegundos.
   */
  public onTilDateChange(): void {
    this.tilDate = (document.getElementById('tilDate') as HTMLInputElement).value;
    if (this.tilDate.length > 0) {
      this.tilDateMilli = Date.parse(this.tilDate);
    }
  }

  /**
   * Evento al cambiar el tipo de informe.
   * Actualiza el tipo en la sesión.
   */


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
   * Cierra el modal mostrado en la interfaz.
   */
  public closeModal() {
    this.showModal = false;
  }

  /**
   * Obtiene datos del Arqueo X desde el servicio correspondiente.
   * Calcula totales de base, cuota, impuestos y porcentajes.
   */
  private getArqueoX() {

    this.loadCompleted = false;
    this.arqueoXService.getArqueoX(this.sinceDateMilli, this.tilDateMilli, this.terminalSelected === this.translate.instant('dpos.filter.all') ? null : this.terminalSelected, this.commerceId).subscribe({
      next: (arqueo) => {
        this.operations = arqueo;
        this.totalBase = 0;
        this.totalCuote = 0;
        this.totalTax = 0;
        this.totalPercentage = 0;
        this.totalValuePercentage = 0;
        if (this.operations !== null && this.operations.balanceLines.length > 0) {
          for (let i = 0; this.operations.balanceLines !== null && i < this.operations.balanceLines.length; i++) {
            if (this.operations.balanceLines[i].itemType === 1 && this.operations.balanceLines[i].itemValue !== -1) {
              this.totalBase = this.totalBase + this.operations.balanceLines[i].base / Math.pow(10, this.operations.balanceLines[i].decimals);
              this.totalCuote = this.totalCuote + this.operations.balanceLines[i].tax / Math.pow(10, this.operations.balanceLines[i].decimals);
              this.totalTax = this.totalTax + this.operations.balanceLines[i].total / Math.pow(10, this.operations.balanceLines[i].decimals);
            }
            if (
              this.operations.balanceLines[i].itemName.substring(0, 3) === 'Efe' ||
              this.operations.balanceLines[i].itemName.substring(0, 3) === 'Tar' ||
              this.operations.balanceLines[i].itemName.substring(0, 3) === 'Val' ||
              this.operations.balanceLines[i].itemName.substring(0, 3) === 'Vir' ||
              this.operations.balanceLines[i].itemName.substring(0, 3) === 'Otr' ||
              this.operations.balanceLines[i].itemName.substring(0, 3) === 'Bon' ||
              this.operations.balanceLines[i].itemName.substring(0, 3) === 'Rec'
            ) {
              this.totalPercentage = this.totalPercentage + this.operations.balanceLines[i].percentage;
              this.totalValuePercentage = this.totalValuePercentage + this.operations.balanceLines[i].total / Math.pow(10, this.operations.balanceLines[i].decimals);
            }
          }
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.arqueox'));
        if (error.status === 400 || error.status === 404 || error.status === 401 || error.status === 500) {
          this.emptySearch = true;
          this.loadCompleted = true;
        }
      }
    });
  }

  /**
   * Obtiene el informe de ventas desde el servicio correspondiente.
   * Calcula totales de unidades y valor.
   */
  private getOperationsReport() {
    this.loadCompleted = false;
    this.operationsReportService.getOperationsReport(this.sinceDateMilli, this.tilDateMilli, this.terminalSelected === this.translate.instant('dpos.filter.all') ? null : this.terminalSelected, this.commerceId).subscribe({
      next: (operationsReport) => {
        this.operationsReports = operationsReport;
        this.indexProduct = Object.values(operationsReport.aggregations);
        this.totalUnits = 0;
        this.totalUnitsValor = 0;
        if (this.indexProduct !== null && this.indexProduct.length > 0) {
          for (const product of this.indexProduct) {
            this.totalUnits += (product.units ?? 2) / Math.pow(10, 3);
            this.totalUnitsValor += product.total / Math.pow(10, 8);
          }
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.operations.report'));
        if (error.status === 400 || error.status === 404 || error.status === 401 || error.status === 500) {
          this.emptySearch = true;
          this.loadCompleted = true;
        }
      }
    });
  }

  /**
   * Devuelve el nombre traducido del tipo de informe según su identificador.
   * 
   * @param reportType Tipo de informe.
   * @returns Nombre traducido del tipo de informe.
   */
  private getReportVarSearch(reportType: number): string {
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

  /**
   * Devuelve el identificador del tipo de informe según su nombre traducido.
   * 
   * @returns Tipo de informe.
   */
  private getReportType(): number {
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

  /**
   * Formatea un timestamp en formato YYYY-MM-DD.
   * 
   * @param timestamp Fecha en milisegundos.
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