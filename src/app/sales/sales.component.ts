import { EncryptionService } from './../_services/encryption.service';
import { SalesinfoService } from './../_services/salesinfo.service';
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../common/base/base.component';
import { Router } from '@angular/router';
import { SalesService } from './sales.service';
import { FormControl, FormGroup } from '@angular/forms';
import { query } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { LanguageManagerService } from '../_services/languagemanager.service';
import { SalesInfo } from '../_models/SalesInfo.model';
import { count } from '@swimlane/ngx-charts';

@Component({
  selector: 'QSC-sales',
  templateUrl: './sales.component.html',
})
export class SalesComponent implements OnInit {
  constructor(private SalesinfoService: SalesinfoService, private EncryptionService:EncryptionService) {}

  size: number = 2147483647;
  sales: SalesInfo;
  selectSales = new Array(3);
  operationN: number;
  totalSales: number = 0;
  totalSalesString: string;
  page: number = 0;
  searchParams0: string = '';
  code: string;

  //Parámetros de búsqueda
  terminalVarSearch: string = '';
  searchCounter: boolean = false;
  sinceDate: string;
  sinceDateMilli: number;
  tilDate: string;
  tilDateMilli: number;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  typeVarSearch: string = '';
  documentVarSearch: string = '';
  varSearch: string = '';
  emptySearch: boolean = false;

  // Checkboxes
  selectedIndices: number[] = [];
  isAllSelected: boolean = false;
  counter = 0;

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
            console.log(this.selectSales[0][i]);
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
              console.log(counterSelect);
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
      }
    );
  }



  //Método de búsqueda

  searchSales() {
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
    if (this.terminalVarSearch.length > 0) {
      console.log(0);
      if (this.searchCounter == false) {
        this.searchCounter = true;
      }
      this.emptySearch = false;
      this.varSearch =
        this.varSearch +
        "{'field':'terminal_number','op':'=','value':'" +
        this.terminalVarSearch +
        "'}";
    }
    //Desde fecha
    if (this.sinceDateMilli > 0) {
      console.log(1);
      console.log(this.searchCounter);
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      console.log(this.searchCounter);
      this.emptySearch = false;
      this.varSearch =
        this.varSearch +
        "{'field':'CreatedAt','op':'>','value':'" +
        this.sinceDateMilli +
        "'}";
    }
    //Hasta fecha
    if (this.tilDateMilli > 0) {
      console.log(2);
      console.log(this.searchCounter);
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      console.log(this.searchCounter);
      this.emptySearch = false;
      this.varSearch =
        this.varSearch +
        "{'field':'CreatedAt','op':'<','value':'" +
        this.tilDateMilli +
        "'}";
    }
    //Tipo de operación
    if (this.typeVarSearch.length > 0) {
      console.log(3);
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.emptySearch = false;
      this.varSearch =
        this.varSearch +
        "{'field':'Type','op':'=','value':'" +
        this.typeVarSearch +
        "'}";
    }
    //Nº de Documento
    if (this.documentVarSearch.length > 0) {
      console.log(4);
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.emptySearch = false;
      this.varSearch =
        this.varSearch +
        "{'field':'Reference','op':'=','value':'" +
        this.documentVarSearch +
        "'}";
    }

    //Búsqueda vacia
    if (this.terminalVarSearch.length == 0 && this.sinceDateMilli == 0 && this.tilDateMilli == 0 && this.typeVarSearch.length == 0 && this.documentVarSearch.length==0) {
      this.SalesinfoService.GetSalesInfo(this.size, this.searchParams0).subscribe(
        (sale) => {
          this.sales = sale;
          this.operationN = this.sales.data.length;
          for (let i = 0; i < this.sales.data.length; i++) {
            this.totalSales = this.totalSales + Number(this.sales.data[i].total);
          }
          this.totalSalesString = this.totalSales.toString() + ' €';})
    }


    //Cierre y reseteo de parámetros
    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;

    console.log(this.varSearch);

    //Llamada API
    this.SalesinfoService.GetSalesInfo(this.size, this.varSearch).subscribe(
      (sale) => {
        this.sales = sale;
        console.log(sale);
        console.log(this.emptySearch);
        if (sale.data.length <= 0) {
          this.emptySearch = true;
        }
        console.log(this.emptySearch);
        this.operationN = this.sales.data.length;
        this.totalSales = 0;
        for (let i = 0; i < this.sales.data.length; i++) {
          this.totalSales = this.totalSales + Number(this.sales.data[i].total);
        }
        this.totalSalesString = this.totalSales.toString() + ' €';
      }
    );
  }

  //Checkboxes

  CheckAll(event: any) {
    if (event.target.checked) {
      this.selectedIndices = [];
      for (let i = 0; i < this.sales.data.length; i++) {
        let globalIndex = i;
        this.selectedIndices.push(globalIndex);
      }
      this.counter = this.selectedIndices.length;
      this.isAllSelected = true;
    } else {
      this.selectedIndices = [];
      this.counter = 0;
      this.isAllSelected = false;
    }
  }

  //Encriptación

  sendSalesDetails(id:string) {

    this.code = this.EncryptionService.encryptData(id)
    this.code = '/details/' + this.EncryptionService.encode(this.code);
    console.log(this.code);
  }


}
