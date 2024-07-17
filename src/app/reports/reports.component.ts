import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { EncryptionService } from '../_services/encryption.service';
import { SalesinfoService } from '../_services/salesinfo.service';
import { SalesInfo } from '../_models/SalesInfo.model';

@Component({
  selector: 'QSC-clients',
  templateUrl: './reports.component.html',
  styleUrls: [],
})
export class ReportsComponent implements OnInit {
  constructor(
    private SalesinfoService: SalesinfoService,
    private EncryptionService: EncryptionService
  ) {}

  size: number = 2147483647;
  sales: SalesInfo;
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
  totalCard: number = 0;
  totalCash: number = 0;
  countCard: number = 0;
  countCash: number = 0;
  percenCard: number = 0;
  percenCash: number = 0;

  //Parámetros de búsqueda
  terminalVarSearch: string = null;
  reportVarSearch: string = 'Impuestos';
  searchCounter: boolean = false;
  sinceDate: string;
  sinceDateMilli: number;
  tilDate: string;
  tilDateMilli: number;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  varSearch: string = null;
  emptySearch: boolean = false;

  ngOnInit(): void {
    this.SalesinfoService.GetSalesInfo(this.size, this.searchParams0).subscribe(
      (sale) => {
        this.sales = sale;
        this.operationN = this.sales.data.length;
        for (let i = 0; i < this.sales.data.length; i++) {
          this.totalSales = this.totalSales + Number(this.sales.data[i].total);
        }
        this.totalSalesString = this.totalSales.toString() + ' €';

        for (let i = 0; i < 3; i++) {
          this.selectSales[i] = new Array(this.sales.data.length);
        }

        //Creación de arrays del select del formulario de búsqueda
        //Terminal

        for (let i = 0; i < this.sales.data.length; i++) {
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
          }
          //Tipo de operación
          if (i == 0) {
            this.selectSales[1][i] = this.sales.data[i].type;
          } else {
            for (let z = 0; z <= i; z++) {
              if (
                this.selectSales[1][z] == this.sales.data[i].type ||
                counterSelect == true
              ) {
                counterSelect = true;
              }

              if (counterSelect == false && z == i) {
                this.selectSales[1][i] = this.sales.data[i].type;
              }
            }
            counterSelect = false;
          }
          //Nº de documento
          if (i == 0) {
            this.selectSales[2][i] = this.sales.data[i].reference;
          } else {
            for (let z = 0; z <= i; z++) {
              if (
                this.selectSales[2][z] == this.sales.data[i].reference ||
                counterSelect == true
              ) {
                counterSelect = true;
              }

              if (counterSelect == false && z == i) {
                this.selectSales[2][i] = this.sales.data[i].reference;
              }
            }
            counterSelect = false;
          }
        }
        //Eliminación espacios en blanco de arrays
        //Terminal
        for (let i = this.sales.data.length - 1; i >= 0; i--) {
          if (this.selectSales[0][i] == null) {
            this.selectSales[0].splice(i, 1);
          }
        }
        //Tipo de operación
        for (let i = this.sales.data.length - 1; i >= 0; i--) {
          if (this.selectSales[1][i] == null) {
            this.selectSales[1].splice(i, 1);
          }
        }
        //Nº de documento
        for (let i = this.sales.data.length - 1; i >= 0; i--) {
          if (this.selectSales[2][i] == null) {
            this.selectSales[2].splice(i, 1);
          }
        }

        //Procesado datos informe métodos de pago

        for (let i = 0; i < this.sales.data.length; i++) {
          for (let z = 0; z < this.sales.data[i].orderPayments.length; z++) {
            //Construir array tipo de metodos de pago
            if (i==0 && z==0){
            this.paymentmethods.push(this.sales.data[i].orderPayments[z].name);
            } else {
              for(let w = 0; w < this.paymentmethods.length; w++){
                if(this.paymentmethods[w]==this.sales.data[i].orderPayments[z].name){
                  this.paymentcheck=true;
                }
              }
              if(this.paymentcheck==false){
                this.paymentmethods.push(this.sales.data[i].orderPayments[z].name);
              }
            }
            //Calcular totales y contadores de cada tipo de pago
            if (this.sales.data[i].orderPayments[z].name == 'Efectivo') {
              this.totalCash =
                this.totalCash + this.sales.data[i].orderPayments[z].amount;
              this.countCash = this.countCash+1;
            }
            if (this.sales.data[i].orderPayments[z].name == 'Tarjeta') {
              this.totalCard =
                this.totalCard + this.sales.data[i].orderPayments[z].amount;
                this.countCard = this.countCard+1;
            }
          }
        }

        //Calcular % de cada tipo de pago

        this.percenCard = (this.countCard*100)/(this.countCard+this.countCash)
        this.percenCash = (this.countCash*100)/(this.countCard+this.countCash)

      }
    );
    this.loadCompleted = true;
  }

  //Método de búsqueda

  searchSales() {
    if( this.terminalVarSearch == ""){
      this.terminalVarSearch=null;
    }
    this.loadCompleted=false;
    //Obtención variables fechas
    this.sinceDate = (<HTMLInputElement>(
      document.getElementById('sinceDate')
    )).value;
    this.sinceDateMilli = Date.parse(this.sinceDate);
    this.tilDate = (<HTMLInputElement>document.getElementById('tilDate')).value;
    this.tilDateMilli = Date.parse(this.tilDate);

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
    if (this.sinceDateMilli > 0) {
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
    this.SalesinfoService.GetSalesInfo(this.size, this.varSearch).subscribe(
      (sale) => {
        this.sales = sale;
        if (sale.data.length <= 0) {
          this.emptySearch = true;
        }
        this.operationN = this.sales.data.length;
        this.totalSales = 0;
        for (let i = 0; i < this.sales.data.length; i++) {
          this.totalSales = this.totalSales + Number(this.sales.data[i].total);
        }
        this.totalSalesString = this.totalSales.toString() + ' €';
        this.loadCompleted=true;
      }
    );
  }

  //Encriptación

  sendSalesDetails(id: string) {
    this.code = this.EncryptionService.encryptData(id);
    this.code = '/details/' + this.EncryptionService.encode(this.code);
  }
}
