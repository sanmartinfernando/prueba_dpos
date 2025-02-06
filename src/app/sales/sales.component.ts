import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from './../_services/encryption.service';
import { SalesinfoService } from './../_services/salesinfo.service';
import { CsvdownloadService } from '../_services/csvdownload.service';
import { Component, OnInit } from '@angular/core';
import { SalesInfo } from '../_models/SalesInfo.model';
import { TerminalList } from '../_models/TerminalList.model';
import { PortalUsersService } from '../_services/portal-users.service';
import { TerminalListService } from '../_services/terminal-list.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'DPOSW-sales',
  templateUrl: './sales.component.html',
})
export class SalesComponent implements OnInit {

  currentFormats: any;
  size: number = 2147483647;
  sales: SalesInfo;
  terminals: TerminalList;
  selectSales = new Array(3);
  salesTicketBai = new Array;
  operationN: number;
  totalSales: number = 0;
  totalSalesString: string;
  page: number = 0;
  searchParams0: string = '';
  code: string;
  loadCompleted: boolean = false;
  isLoggedIn: boolean = true;
  Math = Math;
  validationVariable: boolean = false;

  //Parámetros de búsqueda
  public terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter: boolean = false;
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
  varSearch: string = null;
  emptySearch: boolean = false;

  // Checkboxes
  selectedIndices: number[] = [];
  isAllSelected: boolean = false;
  counter = 0;

  constructor(
    private SalesinfoService: SalesinfoService,
    private EncryptionService: EncryptionService,
    private CsvdownloadService: CsvdownloadService,
    private StorageService: StorageService,
    private PortalUsersService: PortalUsersService,
    private TerminalListService: TerminalListService,
    private CommercesService: CommercesService,
    private AuthService: AuthService
  ) {  }

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
            this.getSalesInfo();
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

    this.validationVariable = false;
    this.loadCompleted = false;
    if (this.terminalSelected == '' || this.typeVarSearch == '') {
      this.terminalSelected = null;
      this.typeVarSearch = null;
    }
    //Obtención variables fechas
    this.loadCompleted = false;
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
    if (this.terminalSelected != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      }
      if (this.terminalSelected == 'Todos') {
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
          this.terminalSelected +
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
    //Tipo de operación
    if (this.typeVarSearch != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      if (this.typeVarSearch == 'Todos') {
        this.varSearch = this.varSearch + "{'or':[";
        for (let i = 0; i < this.selectSales[1].length; i++) {
          if (i == 0) {
            this.varSearch =
              this.varSearch +
              "{'field':'Type','op':'=','value':'" +
              this.translatedTypeVarSearch[i] +
              "'}";
          } else {
            this.varSearch =
              this.varSearch +
              ",{'field':'Type','op':'=','value':'" +
              this.translatedTypeVarSearch[i] +
              "'}";
          }
        }
        this.varSearch = this.varSearch + ']}';
      } else {
        switch (this.typeVarSearch) {
          case 'Venta':
            this.selTransTypeVarSearch = 0;
            break;
          case 'Devolución':
            this.selTransTypeVarSearch = 2;
            break;
          case 'Rectificación':
            this.selTransTypeVarSearch = 5;
        }
        this.emptySearch = false;
        this.varSearch =
          this.varSearch +
          "{'field':'Type','op':'=','value':'" +
          this.selTransTypeVarSearch +
          "'}";
      }
    }
    //Nº de Documento
    if (this.documentVarSearch != null) {
      if (
        this.documentVarSearch.includes('=') ||
        this.documentVarSearch.includes('(') ||
        this.documentVarSearch.includes(')')
      ) {
        this.validationVariable = true;
        this.loadCompleted = true
        return;
      }
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.emptySearch = false;
      this.varSearch =
        this.varSearch +
        "{'field':'Reference','op':'=*.*','value':'" +
        this.documentVarSearch +
        "'}";


    }
    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;

    this.getSalesInfo();
  }

  getSalesInfo() {
    this.SalesinfoService.GetSalesInfo(this.size, this.searchParams0).subscribe(
      (sale) => {
        this.sales = sale;
        this.operationN = this.sales.data.length;
        for (let i = 0; i < this.sales.data.length; i++) {
          this.totalSales = this.totalSales + Number(this.sales.data[i].total);
        }
        this.totalSales = this.totalSales / 100;
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
        //Traducción tipo de operación
        for (let i = this.selectSales[1].length; i >= 0; i--) {
          this.translatedTypeVarSearch[i] = this.selectSales[1][i];
          switch (this.selectSales[1][i]) {
            case 0:
              this.selectSales[1][i] = 'Venta';
              break;
            case 2:
              this.selectSales[1][i] = 'Devolución';
              break;
            case 5:
              this.selectSales[1][i] = 'Rectificación';
          }
        }

        this.loadCompleted = true;

        this.salesTicketBai = []
        for( let i=0; i<= this.sales.data.length; i++){
          if(this.sales.data[i] != null && this.sales.data[i].orderTicketBai != null ){
            if (this.sales.data[i].orderTicketBai.status == '00' && this.sales.data[i].orderTicketBai.warns.length <= 0) {
              this.salesTicketBai[i]=0
            }
            if (this.sales.data[i].orderTicketBai.status == '00' && this.sales.data[i].orderTicketBai.warns.length > 0) {
              this.salesTicketBai[i]=1
            }
            if (this.sales.data[i].orderTicketBai.status == '01') {
              this.salesTicketBai[i]=2
            }
          }
        }
      },
      (error) => {
        if (error.status == 401) {
          this.isLoggedIn = false;
          this.StorageService.clean();
        };
      }
    );
  }

  //Checkboxes
  checkAll(event: any) {
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
  sendSalesDetails(id: string) {
    this.code = this.EncryptionService.encryptData(id);
    this.code = '/details/' + this.EncryptionService.encode(this.code);
  }

  //Boton Descargar
  downloadCSV(){
    this.CsvdownloadService.downloadSalesFile(this.sales, 'Sales', "es-ES");
  }
}
