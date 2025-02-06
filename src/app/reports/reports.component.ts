import { StorageService } from 'src/app/_services/storage.service';
import { ArqueoXService } from './../_services/arqueo-x.service';
import { Component, OnInit } from '@angular/core';
import { EncryptionService } from '../_services/encryption.service';
import { CsvdownloadService } from '../_services/csvdownload.service';
import { Balance } from '../_models/Balance.model';
import { SalesReport, SalesReportAggregations } from '../_models/SalesReport.model';
import { SalesReportService } from '../_services/sales-report.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { TerminalListService } from '../_services/terminal-list.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'DPOSW-clients',
  templateUrl: './reports.component.html',
  styleUrls: [],
})
export class ReportsComponent implements OnInit {

  constructor(
    private EncryptionService: EncryptionService,
    private ArqueoXService: ArqueoXService,
    private SalesReportService: SalesReportService,
    private StorageService: StorageService,
    private CsvdownloadService: CsvdownloadService,
    private PortalUsersService: PortalUsersService,
    private TerminalListService: TerminalListService,
    private CommercesService: CommercesService,
    private AuthService: AuthService
  ) {}

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
  terminalSelected: string = 'Todos';
  reportVarSearch: string = 'Impuestos';
  searchCounter: boolean = false;
  sinceDate: string;
  sinceDateMilli: number = 0;
  tilDate: string;
  tilDateMilli: number = 1721599200000;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  emptySearch: boolean = false;

  ngOnInit(): void {
    this.loadCompleted = false;

    this.StorageService.userInfo.subscribe((user) =>{
      this.CommercesService.commerceId$.subscribe((commerceId) => {
        this.PortalUsersService.GetToken(user).subscribe((portalUserToken)=> {
          this.AuthService.setPortalUsersToken(portalUserToken.token);
          this.TerminalListService.GetTerminalList().subscribe((terminals) => {
            terminals = terminals.filter(terminal => terminal.commerceId = commerceId);
            if(terminals.length != 0) {
              this.terminalsNumber = terminals.map(terminal => terminal.terminalNumber);
            }
            this.terminalsNumber.unshift('Todos');
            this.terminalSelected = this.terminalsNumber[0];
            this.getArqueoX();
            this.getSalesReport();
            this.loadCompleted = true;
          },
          (error) => {
            console.error("Error Commerces: ", error);
          });
        },
        (error) => {
          console.error("Error Portal user token", error);
        });
      });
    });
  }

  //Método de búsqueda
  searchSales() {

    if (this.terminalSelected == 'Todos') {
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
    let varSearch: string = "&qs={'and':[";

    //Parámetros de búsqueda activos
    //Terminal
    if (this.terminalSelected != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      }
      if (this.terminalSelected == 'Todos') {
        varSearch += "{'or':[";
        for (let i = 0; i < this.terminalsNumber.length; i++) {
          if (i == 0) {
            varSearch += "{'field':'terminal_number','op':'=','value':'" + this.terminalsNumber[i] + "'}";
          } else {
            varSearch += ",{'field':'terminal_number','op':'=','value':'" + this.terminalsNumber[i] + "'}";
          }
        }
        varSearch += ']}';
      } else {
        this.emptySearch = false;
        varSearch += "{'field':'terminal_number','op':'=','value':'" + this.terminalSelected + "'}";
      }
    }

    //Desde fecha
    if (this.sinceDateMilli != undefined) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        varSearch += ',';
      }
      this.emptySearch = false;
      varSearch += "{'field':'CreatedAt','op':'>','value':'" + this.sinceDateMilli + "'}";
    }

    //Hasta fecha
    if (this.tilDateMilli > 0) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        varSearch += ',';
      }
      this.emptySearch = false;
      varSearch += "{'field':'CreatedAt','op':'<','value':'" + this.tilDateMilli + "'}";
    }

    //Cierre y reseteo de parámetros
    varSearch += ']}';
    this.searchCounter = false;

    //Llamada API
    if (this.reportVarSearch == 'Impuestos' || this.reportVarSearch == 'Métodos de pago') {
      this.getArqueoX();
    } else {
      this.getSalesReport();
    }
  }

  private getArqueoX() {

    this.loadCompleted = false;

    this.ArqueoXService.GetArqueoX(this.sinceDateMilli, this.tilDateMilli).subscribe(
      (arqueo) => {
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
      (error) => {
        if (error.status == 404) {
          this.loadCompleted = true;
        }
      }
    );
  }

  private getSalesReport() {
    
    this.loadCompleted = false;
    this.SalesReportService.GetSalesReport(this.sinceDateMilli, this.tilDateMilli).subscribe((salesReport) => {

      this.indexProduct = Object.values(salesReport.aggregations);
      //Calculo indices totales productos
      for (let i = 0; i < this.indexProduct.length; i++) {
        this.totalUnits = this.totalUnits + (this.indexProduct[i].units ?? 2) / Math.pow(10, 3);
        this.totalUnitsValor = this.totalUnitsValor + this.indexProduct[i].total / Math.pow(10, 8);
      }

      this.loadCompleted = true;
    },(error) => {
      if (error.status == 404) {
        this.emptySearch = true;
        this.loadCompleted = true;
      }
      if (error.status == 401){
        this.StorageService.clean();
      }
    });
  }

  //Encriptación
  sendSalesDetails(id: string) {
    let code = this.EncryptionService.encryptData(id);
    code = '/details/' + this.EncryptionService.encode(code);
  }

  //Boton Descargar
  downloadReports(){
    if(this.reportVarSearch == 'Impuestos') {
      this.CsvdownloadService.downloadArqueoXFile(this.sales, 'ArqueoX', "es-ES");
    } else if(this.reportVarSearch == 'Productos') {
      this.CsvdownloadService.downloadSalesReportFile(this.salesReports, 'SalesReport', "es-ES");
    } else if(this.reportVarSearch == 'Métodos de pago') {
      this.CsvdownloadService.downloadPaymentMethodsFile(this.sales, 'PaymentMethods', "es-ES");
    }
  }
}