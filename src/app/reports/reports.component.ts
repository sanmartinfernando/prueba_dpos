import { StorageService } from 'src/app/_services/storage.service';
import { ArqueoXService } from './../_services/arqueo-x.service';
import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'DPOSW-clients',
  templateUrl: './reports.component.html',
  styleUrls: [],
})
export class ReportsComponent implements OnInit {

  constructor(
    private encryptionService: EncryptionService,
    private arqueoXService: ArqueoXService,
    private salesReportService: SalesReportService,
    private storageService: StorageService,
    private downloadCsvService: DownloadCsvService,
    private portalUsersService: PortalUsersService,
    private terminalsService: TerminalsService,
    private commercesService: CommercesService,
    public translate: TranslateService,
    private authService: AuthService
  ) {
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
      this.terminalSelected = this.translate.instant('dpos.filter.all');
      this.reportVarSearch = this.translate.instant('dpos.reports.taxes.label');
    });

  }

  size: number = 2147483647;
  sales: Balance;
  salesReports: SalesReport;
  indexProduct: SalesReportAggregations[];
  page: number = 0;
  searchParams0: string = '';
  loadCompleted: boolean = false;
  Math = Math;
  totalUnits: number = 0;
  totalUnitsValor: number = 0;
  totalBase: number = 0;
  totalCuote: number = 0;
  totalPercentage: number = 0;
  totalValuePercentage: number = 0;

  //Parámetros de búsqueda
  terminalsNumber: string[];
  terminalSelected: string;
  reportVarSearch: string = this.translate.instant('dpos.reports.taxes.label');;
  searchCounter: boolean = false;
  sinceDate: string;
  sinceDateMilli: number = 0;
  tilDate: string;
  tilDateMilli: number = 1721599200000;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  varSearch: string = '';
  emptySearch: boolean = false;
  commerceId: number = 0;

  currentLang: string;
  langSubscription: Subscription;

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadCompleted = false;
    this.storageService.userInfo.subscribe((user) =>{
      this.commercesService.commerceId$.subscribe((commerceId) => {
        this.commerceId = commerceId;
        this.portalUsersService.getToken(user).subscribe({
          next: (portalUserToken)=> {
            this.authService.setPortalUsersToken(portalUserToken.token);
            this.terminalsService.getTerminalList().subscribe({
              next: (terminals) => {
                terminals = terminals.filter(terminal => terminal.commerceId == commerceId && terminal.terminalNumber != null);
                if(terminals.length != 0) {
                  this.terminalsNumber = terminals.map(terminal => terminal.terminalNumber);
                }
                this.terminalsNumber.unshift(this.translate.instant('dpos.filter.all'));
                this.terminalSelected = this.terminalsNumber[0];
                this.searchReports();
                this.loadCompleted = true;
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
    });
  }

  //Método de búsqueda
  searchReports() {
    if (this.terminalSelected == this.translate.instant('dpos.filter.all')) {
      this.terminalSelected = null;
    }
    this.loadCompleted = false;
    //Obtención variables fechas
    this.sinceDate = (<HTMLInputElement>(document.getElementById('sinceDate'))).value;
    if(this.sinceDate.length>0){
      this.sinceDateMilli = Date.parse(this.sinceDate);
    }
    this.tilDate = (<HTMLInputElement>document.getElementById('tilDate')).value;
    if(this.tilDate.length>0){
      this.tilDateMilli = Date.parse(this.tilDate);
    }
    //Comienzo query búsqueda
    this.varSearch = "&qs={'and':[";
    //Parámetros de búsqueda activos
    //Terminal
    if (this.terminalSelected != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      }
      if (this.terminalSelected == this.translate.instant('dpos.filter.all')) {
        this.varSearch = this.varSearch + "{'or':[";
        for (let i = 1; i < this.terminalsNumber.length; i++) {
          this.varSearch = this.varSearch + "{'field':'terminal_number','op':'=','value':'" + this.terminalsNumber[i] + "'}";
            if (i+1 < this.terminalsNumber.length) {
              this.varSearch = this.varSearch + ",";
            }
        }
        this.varSearch = this.varSearch + ']}';
      } else {
        //this.emptySearch = false;
        this.varSearch = this.varSearch + "{'field':'terminal_number','op':'=','value':'" + this.terminalSelected + "'}";
      }
    }

    //Commerce id
    if (this.commerceId != 0) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      //this.emptySearch = false;
      this.varSearch =
      this.varSearch +"{'field':'CommerceId','op':'=','value':'" +this.commerceId +"'}";
    }

    //Desde fecha
    if (this.sinceDateMilli != undefined) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch += ',';
      }
      //this.emptySearch = false;
      this.varSearch += "{'field':'CreatedAt','op':'>','value':'" + this.sinceDateMilli + "'}";
    }
    //Hasta fecha
    if (this.tilDateMilli > 0) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch += ',';
      }
      //this.emptySearch = false;
      this.varSearch += "{'field':'CreatedAt','op':'<','value':'" + this.tilDateMilli + "'}";
    }
    //Cierre y reseteo de parámetros
    this.varSearch += ']}';
    this.searchCounter = false;
    //Llamada API
    if (this.reportVarSearch == this.translate.instant('dpos.reports.taxes.label') || this.reportVarSearch == this.translate.instant('dpos.reports.paymentmethods.label')) { 
      this.getArqueoX();
    } else {//Productos
      this.getSalesReport();
    }
  }

  private getArqueoX() {
    this.loadCompleted = false;
    this.arqueoXService.getArqueoX(this.sinceDateMilli, this.tilDateMilli, this.varSearch).subscribe({
      next: (arqueo) => {
        this.sales = arqueo;
        //Calculo de indicadores totales informes
        for (let i = 0; this.sales.balanceLines != null && i < this.sales.balanceLines.length; i++) {
          if (this.sales.balanceLines[i].itemName.substring(0, 3) == 'IVA') {
            this.totalBase = this.totalBase + this.sales.balanceLines[i].base / Math.pow(10, this.sales.balanceLines[i].decimals);
            this.totalCuote = this.totalCuote + this.sales.balanceLines[i].total / Math.pow(10, this.sales.balanceLines[i].decimals);
          }
          if (
            this.sales.balanceLines[i].itemName.substring(0, 3) == 'Efe' ||
            this.sales.balanceLines[i].itemName.substring(0, 3) == 'Tar' ||
            this.sales.balanceLines[i].itemName.substring(0, 3) == 'Val' ||
            this.sales.balanceLines[i].itemName.substring(0, 3) == 'Vir' ||
            this.sales.balanceLines[i].itemName.substring(0, 3) == 'Otr' ||
            this.sales.balanceLines[i].itemName.substring(0, 3) == 'Bon' ||
            this.sales.balanceLines[i].itemName.substring(0, 3) == 'Rec'
          ) {
            this.totalPercentage = this.totalPercentage + this.sales.balanceLines[i].percentage;
            this.totalValuePercentage = this.totalValuePercentage + this.sales.balanceLines[i].total / Math.pow(10, this.sales.balanceLines[i].decimals);
          }
        }
        this.loadCompleted = true;
      }, 
      error: (error) => {
        if (error.status == 404) {
          this.loadCompleted = true;
        }
      }
    });
  }

  private getSalesReport() {
    this.loadCompleted = false;
    this.salesReportService.getSalesReport(this.sinceDateMilli, this.tilDateMilli, this.varSearch).subscribe({
      next: (salesReport) => {
        this.salesReports = salesReport;
        this.indexProduct = Object.values(salesReport.aggregations);
        //Calculo indices totales productos
        for (let i = 0; i < this.indexProduct.length; i++) {
          this.totalUnits = this.totalUnits + (this.indexProduct[i].units ?? 2) / Math.pow(10, 3);
          this.totalUnitsValor = this.totalUnitsValor + this.indexProduct[i].total / Math.pow(10, 8);
        }
        this.loadCompleted = true;
      },
      error: (error) => {
        if (error.status == 404) {
          this.emptySearch = true;
          this.loadCompleted = true;
        }
        if (error.status == 401 || error.status == 500) {
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
  downloadReports(){
    if(this.reportVarSearch == this.translate.instant('dpos.reports.taxes.label')) {
      this.downloadCsvService.downloadArqueoXFile(this.sales, 'ArqueoX', this.currentLang);
    } else if(this.reportVarSearch == this.translate.instant('dpos.reports.products.label')) {
      this.downloadCsvService.downloadSalesReportFile(this.salesReports, 'SalesReport', this.currentLang);
    } else if(this.reportVarSearch == this.translate.instant('dpos.reports.paymentmethods.label')) {
      this.downloadCsvService.downloadPaymentMethodsFile(this.sales, 'PaymentMethods', this.currentLang);
    }
  }
}