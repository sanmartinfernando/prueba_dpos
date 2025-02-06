import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from './../_services/encryption.service';
import { BalanceinfoService } from './../_services/balanceinfo.service';
import { CsvdownloadService } from '../_services/csvdownload.service';
import { Component, OnInit } from '@angular/core';
import { PortalUsersService } from '../_services/portal-users.service';
import { TerminalListService } from '../_services/terminal-list.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';
import { Balance } from '../_models/Balance.model';

@Component({
  selector: 'DPOSW-balances',
  templateUrl: './balances.component.html',
  styleUrls: [],
})
export class BalancesComponent implements OnInit {

  constructor(private BalanceinfoService: BalanceinfoService, 
    private EncryptionService: EncryptionService, 
    private StorageService: StorageService, 
    private CsvdownloadService: CsvdownloadService,
    private PortalUsersService: PortalUsersService,
    private TerminalListService: TerminalListService,
    private CommercesService: CommercesService,
    private AuthService: AuthService) {

    }

  Math = Math;
  balances: Balance[];
  page: number = 0;
  code: string;
  loadCompleted: boolean = false;
  mismatch = new Array;

  public terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter: boolean = false;
  sinceDate: string;
  sinceDateMilli: number;
  tilDate: string;
  tilDateMilli: number;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  varSearch: string = null;
  emptySearch: boolean = false;

  // Checkboxes
  selectedIndices: number[] = [];
  isAllSelected: boolean = false;
  counter = 0;

  ngOnInit(): void {

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
            this.getBalanceInfo();
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

    if( this.terminalSelected == ""){
      this.terminalSelected=null;
    }

    //Obtención variables fechas
    this.sinceDate = (<HTMLInputElement>(document.getElementById('sinceDate'))).value;
    this.sinceDateMilli = Date.parse(this.sinceDate);
    this.tilDate = (<HTMLInputElement>document.getElementById('tilDate')).value;
    this.tilDateMilli = Date.parse(this.tilDate);

    //Comienzo query búsqueda
    this.varSearch = "&qs={'and':[";

    //Parámetros de búsqueda activos
    //Terminal
    if (this.terminalSelected != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      }
      this.emptySearch = false;
      this.varSearch = this.varSearch + "{'field':'terminal_number','op':'=','value':'" + this.terminalSelected + "'}";
    }

    //Desde fecha
    if (this.sinceDateMilli > 0) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.emptySearch = false;
      this.varSearch = this.varSearch + "{'field':'StartedAt','op':'>','value':'" + this.sinceDateMilli + "'}";
    }

    //Hasta fecha
    if (this.tilDateMilli > 0) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.emptySearch = false;
      this.varSearch = this.varSearch + "{'field':'FinishedAt','op':'<','value':'" + this.tilDateMilli + "'}";
    }

    //Búsqueda vacia
    if (this.terminalSelected!= null && this.sinceDateMilli == 0 && this.tilDateMilli == 0) {
      this.getBalanceInfo();
    }

    //Cierre y reseteo de parámetros
    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;

    this.getBalanceInfo();
  }


  //Llamada API
  getBalanceInfo() {
    this.loadCompleted=false;
    let size: number = 2147483647;
    let selectSales = new Array(3);
    let searchParams0: string = '';


    this.BalanceinfoService.GetBalanceInfo(size, searchParams0).subscribe(
      (balanceInfo) => {
        this.balances = balanceInfo.data;
        for (let i = 0; i < 3; i++) {
          selectSales[i] = new Array(this.balances.length);
        }

      //Creación de arrays del select del formulario de búsqueda
        //Terminal

        for (let i = 0; i < this.balances.length; i++) {
          let balance: Balance = this.balances[i];
          this.mismatch[i] = Math.abs(balance.manualCashRecount)-Math.abs(balance.autoCashRecount);
          let counterSelect: boolean = false;
          if (i == 0) {
            selectSales[0][i] = balance.terminalNumber;
          } else {
            for (let z = 0; z <= i; z++) {
              if (selectSales[0][z] == balance.terminalNumber || counterSelect == true) {
                counterSelect = true;
              }
              if (counterSelect == false && z == i) {
                selectSales[0][i] = balance.terminalNumber;
              }
            }
            counterSelect = false;
          }

          //Eliminación espacios en blanco de arrays
          //Terminal
          for (let i = this.balances.length - 1; i >= 0; i--) {
            if (selectSales[0][i] == null) {
              selectSales[0].splice(i, 1);
            }
          }
        }
        this.loadCompleted=true;
      },
      (error) => {
        if (error.status == 401) {
          this.StorageService.clean();
        };
      }
    );
  }

  //Checkboxes
  checkAll(event: any) {
    if (event.target.checked) {
      this.selectedIndices = [];
      for (let i = 0; i < this.balances.length; i++) {
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

  //Boton Descargar CSV
  downloadCSV(){
    this.CsvdownloadService.downloadBalancesFile(this.balances, 'Balances', "es-ES");
  }

}
