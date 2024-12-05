import { StorageService } from 'src/app/_services/storage.service';
import { ArqueoXService } from './../_services/arqueo-x.service';
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { EncryptionService } from '../_services/encryption.service';
import { CsvdownloadService } from '../_services/csvdownload.service';
import { ArqueoX } from '../_models/ArqueoX.model';
import { SalesReport } from '../_models/SalesReport.model';
import { SalesReportService } from '../_services/sales-report.service';

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
    private CsvdownloadService: CsvdownloadService
  ) {}

  emptyA: boolean = false;
  size: number = 2147483647;
  sales: ArqueoX;
  salesReports: SalesReport;
  indexProduct;
  arraySalesRports;
  selectSales = new Array(3);
  operationN: number;
  totalSales: number = 0;
  totalSalesString: string;
  page: number = 0;
  searchParams0: string = '';
  code: string;
  loadCompleted: boolean = false;
  paymentmethods = [];
  paymentcheck: boolean = false;
  isLoggedIn: boolean = true;
  Math = Math;
  totalUnits: number = 0;
  totalUnitsValor: number = 0;
  totalBase: number = 0;
  totalCuote: number = 0;
  totalPercentage: number = 0;
  totalValuePercentage: number = 0;

  //Parámetros de búsqueda
  terminalVarSearch: string = null;
  reportVarSearch: string = 'Impuestos';
  searchCounter: boolean = false;
  sinceDate: string;
  sinceDateMilli: number = 0;
  tilDate: string;
  tilDateMilli: number = 1721599200000;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  varSearch: string = null;
  emptySearch: boolean = false;

  ngOnInit(): void {
    this.emptyA = false;
    this.ArqueoXService.GetArqueoX(
      this.sinceDateMilli,
      this.tilDateMilli
    ).subscribe(
      (arqueo) => {
        this.sales = arqueo;
        //Calculo de indicadores totales informes

        for (let i = 0; i <= this.sales.balanceLines.length; i++) {
          if (this.sales.balanceLines[i].itemName.substring(0, 3) == 'IVA') {
            this.totalBase =
              this.totalBase +
              this.sales.balanceLines[i].base /
                Math.pow(10, this.sales.balanceLines[i].decimals);
            this.totalCuote =
              this.totalCuote +
              this.sales.balanceLines[i].total /
                Math.pow(10, this.sales.balanceLines[i].decimals);
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
            this.totalPercentage =
              this.totalPercentage + this.sales.balanceLines[i].percentage;
            this.totalValuePercentage =
              this.totalValuePercentage +
              this.sales.balanceLines[i].total /
                Math.pow(10, this.sales.balanceLines[i].decimals);
          }
        }

        //Creación de arrays del select del formulario de búsqueda
        //Terminal

        /* for (let i = 0; i < this.sales.data.length; i++) {
          let counterSelect: boolean = false;
          if (i == 0) {
            this.selectSales[0][i] = this.sales.data[i].terminalNumber;
          } else {
            for (let z = 0; z <= i; z++) {
              if (
                this.selectSales[0][z] == this.sales.data[i].terminalNumber ||
                counterSelect == true
              ) {
                counterSelect = true;
              }
              if (counterSelect == false && z == i) {
                this.selectSales[0][i] = this.sales.data[i].terminalNumber;
              }
            }
            counterSelect = false;
          } */

        //Eliminación espacios en blanco de arrays
        //Terminal
        /* for (let i = this.sales.data.length - 1; i >= 0; i--) {
          if (this.selectSales[0][i] == null) {
            this.selectSales[0].splice(i, 1);
          }
        } */

        //Procesado datos informe métodos de pago
        /*
        for (let i = 0; i < this.sales.data.length; i++) {
          for (let z = 0; z < this.sales.data[i].orderPayments.length; z++) { */
        //Construir array tipo de metodos de pago
        /* if (i == 0 && z == 0) {
              this.paymentmethods.push(
                this.sales.data[i].orderPayments[z].name
              );
            } else {
              for (let w = 0; w < this.paymentmethods.length; w++) {
                if (
                  this.paymentmethods[w] ==
                  this.sales.data[i].orderPayments[z].name
                ) {
                  this.paymentcheck = true;
                }
              }
              if (this.paymentcheck == false) {
                this.paymentmethods.push(
                  this.sales.data[i].orderPayments[z].name
                );
              }
            } */
        //Calcular totales y contadores de cada tipo de pago
        /*  if (this.sales.data[i].orderPayments[z].name == 'Efectivo') {
              this.totalCash =
                this.totalCash + this.sales.data[i].orderPayments[z].amount;
              this.countCash = this.countCash + 1;
            }
            if (this.sales.data[i].orderPayments[z].name == 'Tarjeta') {
              this.totalCard =
                this.totalCard + this.sales.data[i].orderPayments[z].amount;
              this.countCard = this.countCard + 1;
            }
          }
        } */

        //Calcular % de cada tipo de pago

        /*  this.percenCard =
          (this.countCard * 100) / (this.countCard + this.countCash);
        this.percenCash =
          (this.countCash * 100) / (this.countCard + this.countCash); */

        this.loadCompleted = true;
      },
      (error) => {
       /*  if (error.status == 401) {
          this.isLoggedIn = false;
          this.StorageService.clean();
        } */
        if (error.status == 404) {
          console.log(this.emptyA)
          this.emptyA = true;
          console.log(this.emptyA)
        }
      }
    );
    this.SalesReportService.GetSalesReport(
      this.sinceDateMilli,
      this.tilDateMilli
    ).subscribe((salesReport) => {
      this.indexProduct = Object.values(salesReport.aggregations);
      this.loadCompleted = true;

      //Calculo indices totales productos

      for (let i = 0; i <= this.indexProduct.length; i++) {
        this.totalUnits =
          this.totalUnits + this.indexProduct[i].units / Math.pow(10, 3);
        this.totalUnitsValor =
          this.totalUnitsValor + this.indexProduct[i].total / Math.pow(10, 8);
      }
    });
  }

  //Método de búsqueda

  searchSales() {
    this.emptyA = false;
    if (this.terminalVarSearch == '') {
      this.terminalVarSearch = null;
    }
    this.loadCompleted = false;
    //Obtención variables fechas
    this.sinceDate = (<HTMLInputElement>(
      document.getElementById('sinceDate')
    )).value;
    if(this.sinceDate.length>0){
    this.sinceDateMilli = Date.parse(this.sinceDate);}
    this.tilDate = (<HTMLInputElement>document.getElementById('tilDate')).value;
    if(this.tilDate.length>0){
    this.tilDateMilli = Date.parse(this.tilDate);}

    //Comienzo query búsqueda
    this.varSearch = "&qs={'and':[";

    //Parámetros de búsqueda activos
    //Terminal
    if (this.terminalVarSearch != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      }
      if (this.terminalVarSearch == 'Todos') {
        this.varSearch = this.varSearch + "{'or':[";
        for (let i = 0; i < this.selectSales[0].length; i++) {
          if (i == 0) {
            this.varSearch =
              this.varSearch +
              "{'field':'terminal_number','op':'=','value':'" +
              this.selectSales[0][i] +
              "'}";
          } else {
            this.varSearch =
              this.varSearch +
              ",{'field':'terminal_number','op':'=','value':'" +
              this.selectSales[0][i] +
              "'}";
          }
        }
        this.varSearch = this.varSearch + ']}';
      } else {
        this.emptySearch = false;
        this.varSearch =
          this.varSearch +
          "{'field':'terminal_number','op':'=','value':'" +
          this.terminalVarSearch +
          "'}";
      }
    }
    //Desde fecha
    if (this.sinceDateMilli != undefined) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.emptySearch = false;
      this.varSearch =
        this.varSearch +
        "{'field':'CreatedAt','op':'>','value':'" +
        this.sinceDateMilli +
        "'}";
    }
    //Hasta fecha
    if (this.tilDateMilli > 0) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.emptySearch = false;
      this.varSearch =
        this.varSearch +
        "{'field':'CreatedAt','op':'<','value':'" +
        this.tilDateMilli +
        "'}";
    }

    //Cierre y reseteo de parámetros
    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;

    //Llamada API
    if (
      this.reportVarSearch == 'Impuestos' ||
      this.reportVarSearch == 'Métodos de pago'
    ) {
      this.ArqueoXService.GetArqueoX(
        this.sinceDateMilli,
        this.tilDateMilli
      ).subscribe(
        (sale) => {
          this.sales = sale;
          if (sale.balanceLines.length <= 0) {
            this.emptySearch = true;
          }
          this.loadCompleted = true;
        },
        (error) => {
          if (error.status == 404) {
            this.emptySearch = true;
            this.loadCompleted = true;
            this.emptyA = true;
          }
        }
      );
    } else {
      this.SalesReportService.GetSalesReport(
        this.sinceDateMilli,
        this.tilDateMilli
      ).subscribe(
        (salesReport) => {
          this.indexProduct = Object.values(salesReport.aggregations);
          this.loadCompleted = true;
        },
        (error) => {
          if (error.status == 404) {
            this.emptySearch = true;
            this.loadCompleted = true;
            this.emptyA = true;
          }
          if (error.status == 401){
          this.isLoggedIn = false;
          this.StorageService.clean();
        }
      }


      );
    }
  }

  //Encriptación

  sendSalesDetails(id: string) {
    this.code = this.EncryptionService.encryptData(id);
    this.code = '/details/' + this.EncryptionService.encode(this.code);
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
