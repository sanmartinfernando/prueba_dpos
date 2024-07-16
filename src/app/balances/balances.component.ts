import { EncryptionService } from './../_services/encryption.service';
import { BalanceinfoService } from './../_services/balanceinfo.service';
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../common/base/base.component';
import { Data, Router, Routes } from '@angular/router';
import { DataServices } from './data.services';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BalanceInfo } from '../_models/BalanceInfo.model';

@Component({
  selector: 'QSC-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.css'],
})
export class BalancesComponent implements OnInit {
  // ---------------- Propiedades------------------

  constructor(private BalanceinfoService: BalanceinfoService, private EncryptionService: EncryptionService) {}

  size: number = 2147483647;
  balances: BalanceInfo;
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
  varSearch: string = '';
  emptySearch: boolean = false;

  // Checkboxes
  selectedIndices: number[] = [];
  isAllSelected: boolean = false;
  counter = 0;

  ngOnInit(): void {
    this.BalanceinfoService.GetBalanceInfo(this.size, this.searchParams0).subscribe(
      (balance) => {
        this.balances = balance;
        this.operationN = this.balances.data.length;
        for (let i = 0; i < this.balances.data.length; i++) {
          this.totalSales = this.totalSales + Number(this.balances.data[i].total);
        }
        this.totalSalesString = this.totalSales.toString() + ' €';

        for (let i = 0; i < 3; i++) {
          this.selectSales[i] = new Array(this.balances.data.length);
        }

      //Creación de arrays del select del formulario de búsqueda
        //Terminal

        for (let i = 0; i < this.balances.data.length; i++) {
          let counterSelect: boolean = false;
          if (i == 0) {
            this.selectSales[0][i] = this.balances.data[i].terminalNumber;
            console.log(this.selectSales[0][i]);
          } else {
            for (let z = 0; z <= i; z++) {
              if (
                this.selectSales[0][z] == this.balances.data[i].terminalNumber ||
                counterSelect == true
              ) {
                counterSelect = true;
              }
              if (counterSelect == false && z == i) {
                this.selectSales[0][i] = this.balances.data[i].terminalNumber;
              }
            }
            counterSelect = false;
          }

        //Eliminación espacios en blanco de arrays
          //Terminal
        for (let i = this.balances.data.length - 1; i >= 0; i--) {
          if (this.selectSales[0][i] == null) {
            this.selectSales[0].splice(i, 1);
          }
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
        "{'field':'StartedAt','op':'>','value':'" +
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
        "{'field':'FinishedAt','op':'<','value':'" +
        this.tilDateMilli +
        "'}";
    }


    //Búsqueda vacia
    if (this.terminalVarSearch.length == 0 && this.sinceDateMilli == 0 && this.tilDateMilli == 0) {
      this.BalanceinfoService.GetBalanceInfo(this.size, this.searchParams0).subscribe(
        (balance) => {
          this.balances = balance;
          this.operationN = this.balances.data.length;
          for (let i = 0; i < this.balances.data.length; i++) {
            this.totalSales = this.totalSales + Number(this.balances.data[i].total);
          }
          this.totalSalesString = this.totalSales.toString() + ' €';})
    }


    //Cierre y reseteo de parámetros
    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;

    console.log(this.varSearch);

    //Llamada API
    this.BalanceinfoService.GetBalanceInfo(this.size, this.varSearch).subscribe(
      (balance) => {
        this.balances = balance;
        if (balance.data.length <= 0) {
          this.emptySearch = true;
        }
        console.log(this.emptySearch);
        this.operationN = this.balances.data.length;
        this.totalSales = 0;
        for (let i = 0; i < this.balances.data.length; i++) {
          this.totalSales = this.totalSales + Number(this.balances.data[i].total);
        }
        this.totalSalesString = this.totalSales.toString() + ' €';
      }
    );
  }

  //Checkboxes

  CheckAll(event: any) {
    if (event.target.checked) {
      this.selectedIndices = [];
      for (let i = 0; i < this.balances.data.length; i++) {
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
    this.code = '/balances-details/' + this.EncryptionService.encode(this.code);
    }


}
