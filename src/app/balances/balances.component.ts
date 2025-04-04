import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from './../_services/encryption.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Component, OnInit } from '@angular/core';
import { PortalUsersService } from '../_services/portal-users.service';
import { TerminalsService } from '../_services/terminals.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';
import { Balance } from '../_models/balance.model';
import { BalancesService } from '../_services/balances.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { SessionService } from '../_services/session.service';

@Component({
  selector: 'DPOSW-balances',
  templateUrl: './balances.component.html',
  styleUrls: [],
})
export class BalancesComponent implements OnInit {

  constructor(private balancesService: BalancesService,
    private encryptionService: EncryptionService, 
    private storageService: StorageService, 
    private downloadCsvService: DownloadCsvService,
    private portalUsersService: PortalUsersService,
    private terminalsService: TerminalsService,
    private commercesService: CommercesService,
    private sessionService: SessionService,
    private translate: TranslateService,
    private authService: AuthService) {
      this.currentLang = this.translate.currentLang || 'es';
      this.langSubscription = this.translate.onLangChange.subscribe(event => {
        this.currentLang = event.lang;
        this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
      });
    }
    
  Math = Math;
  balances: Balance[];
  page: number = 0;
  code: string;
  loadCompleted: boolean = false;
  mismatch = new Array;

  terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter: boolean = false;
  sinceDate: string;
  sinceDateMilli: number;
  tilDate: string;
  tilDateMilli: number;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  varSearch: string = '';
  emptySearch: boolean = false;
  commerceId: number = 0;

  selectedIndices: number[] = [];
  isAllSelected: boolean = false;
  counter = 0;

  currentLang: string;
  langSubscription: Subscription;

  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }
  
  ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) =>{
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken)=> {
          this.authService.setPortalUsersToken(portalUserToken.token);
          this.commercesService.getCommerceList().subscribe({
            next: (commerces) => {
              this.sessionService.getCommerceId().subscribe((commerceId) => {
                this.commerceId = commerceId;
                this.terminalsService.getTerminalList().subscribe({
                  next: (terminals) => {
                    terminals = terminals.filter(terminal => terminal.commerceId == this.commerceId && terminal.terminalNumber != null);
                    if(terminals.length != 0) {
                      this.terminalsNumber = terminals.map(terminal => terminal.terminalNumber);
                    }
                    this.terminalsNumber.unshift(this.translate.instant('dpos.filter.all'));
                    this.terminalSelected = this.terminalsNumber[0];
                    this.searchBalances();
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
  searchBalances() {
    if (this.terminalSelected == '') {
      this.terminalSelected = null;
    }

    //Obtención variables fechas
    this.sinceDate = (<HTMLInputElement>(document.getElementById('sinceDate'))).value;
    this.sinceDateMilli = Date.parse(this.sinceDate);

    this.tilDate = (<HTMLInputElement>document.getElementById('tilDate')).value;
    let date = new Date(this.tilDate);
    // Establecer la hora a las 23:59
    date.setHours(23, 59, 0, 0);
    this.tilDateMilli = date.getTime();

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
    if (this.sinceDateMilli > 0) {
      if(this.sinceDateMilli > this.tilDateMilli && this.tilDateMilli > 0) {
        this.modalTitle = this.translate.instant('dpos.modal.fromDate.title');
        this.modalMessage = this.translate.instant('dpos.modal.fromDate.message');
        this.openModal();
        this.emptySearch = true;
        return;
      } else {
        if (this.searchCounter == false) {
          this.searchCounter = true;
        } else {
          this.varSearch = this.varSearch + ',';
        }
        this.emptySearch = false;
        this.varSearch = this.varSearch + "{'field':'StartedAt','op':'>','value':'" + this.sinceDateMilli + "'}";
      }
    }

    //Hasta fecha
    if (this.tilDateMilli > 0) {
      if(this.tilDateMilli < this.sinceDateMilli && this.sinceDateMilli > 0) {
        this.modalTitle = this.translate.instant('dpos.filter.toDate.title');
        this.modalMessage = this.translate.instant('dpos.filter.toDate.message');
        this.openModal();
        this.emptySearch = true;
        return;
      } else {
        if (this.searchCounter == false) {
          this.searchCounter = true;
        } else {
          this.varSearch = this.varSearch + ',';
        }
        this.emptySearch = false;
        this.varSearch = this.varSearch = this.varSearch + "{'field':'FinishedAt','op':'<=','value':'" + this.tilDateMilli + "'}";
      }
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
    this.balancesService.getBalanceInfo(size, this.varSearch).subscribe({
      next: (balanceInfo) => {
        this.balances = balanceInfo.data;
        if(this.balances.length != 0) {
          this.emptySearch = false;
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
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted=true;
      },
      error: (error) => {
        if (error.status == 401  || error.status == 500) {
          this.loadCompleted = true;
        };
      }
    });
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
    this.code = this.encryptionService.encryptData(id)
    this.code = '/balances-details/' + this.encryptionService.encode(this.code);
  }

  //Boton Descargar CSV
  downloadCSV(){
    this.downloadCsvService.downloadBalancesFile(this.balances, 'Balances', this.currentLang);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
