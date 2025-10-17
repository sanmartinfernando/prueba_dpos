import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { Balance } from '../_models/balance.model';
import { BalancesService } from '../_services/balances.service';
import { CommercesService } from '../_services/commerces.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { EncryptionService } from './../_services/encryption.service';
import { SessionService } from '../_services/session.service';
import { TerminalsService } from '../_services/terminals.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { Commerce } from '../_models/commerce.model';

/**
 * @class BalancesComponent
 * @description
 * Componente para la gestión y visualización de cierres de caja.
 * Permite buscar, filtrar, exportar y visualizar detalles de cierres de caja.
 */
@Component({
  selector: 'app-dpos-balances',
  templateUrl: './balances.component.html',
  styleUrls: [],
})
export class BalancesComponent implements OnInit, OnDestroy {

  private balancesService = inject(BalancesService);
  private encryptionService = inject(EncryptionService);
  private downloadCsvService = inject(DownloadCsvService);
  private terminalsService = inject(TerminalsService);
  private commercesService = inject(CommercesService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);
  private uiStateService = inject(UIStateService);
  private router = inject(Router);

  Math = Math;
  balances: Balance[];
  page = 0;
  loadCompleted = false;
  mismatch = [];

  terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter = false;
  sinceDate: string;
  sinceDateMilli: number;
  tilDate: string;
  tilDateMilli: number;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  varSearch = '';
  emptySearch = false;
  commerceId = 0;

  selectedIndices: number[] = [];
  isAllSelected = false;
  counter = 0;

  currentLang: string;
  langSubscription: Subscription;

  showModal = false;
  modalTitle = '';
  modalMessage = '';

  isComercia = false;

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.uiStateService.setFormSelectEnabled(true);

    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
    });
  }

  ngOnInit(): void {


    this.commercesService.getCommerceList().subscribe({
      next: (commerces) => {
        this.sessionService.getCommerceId().subscribe((commerceId) => {
          this.commerceId = commerceId !== 0 ? commerceId : commerces[0].commerceId;
          if (commerceId === 0) {
            this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
          }
          this.isComercia = this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
          this.terminalsService.getTerminalList().subscribe({
            next: (terminals) => {
              terminals = terminals.filter(t => t.commerceId === this.commerceId && t.terminalNumber !== null);
              if (terminals.length) {
                this.terminalsNumber = terminals.map(t => t.terminalNumber);
              }
              this.terminalsNumber.unshift(this.translate.instant('dpos.filter.all'));
              if (this.terminalSelected === null) {
                this.terminalSelected = this.terminalsNumber[0];

              } else {
                this.terminalSelected = this.terminalsNumber[0];
              }
              this.searchBalances();
            },
            error: (error) => {
              this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.terminals'));
              console.error('Error Terminals:', error);
            }
          });
        });
      },
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.commerces'));
        console.error('Error Commerces:', error)
      }
    });
  }

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
  }

  /**
  * Resetea los filtros de búsqueda a sus valores por defecto.
  */
  public resetReports() {
    this.terminalSelected = this.terminalsNumber[0];
    const yearDate = new Date(new Date().getFullYear(), 0);
    this.tilDateMilli = yearDate.getTime() + 31536000000;
    this.tilDate = this.formatDate(this.tilDateMilli);
    this.varSearch = '';
    this.getBalanceInfo();
  }

  /**
   * Ejecuta la búsqueda de cierres de caja aplicando los filtros seleccionados.
   */
  public searchBalances(): void {
    if (this.terminalSelected === '') {
      this.terminalSelected = null;
    }

    this.sinceDateMilli = Date.parse(this.sinceDate);
    const date = new Date(this.tilDate);
    date.setHours(23, 59, 0, 0);
    this.tilDateMilli = date.getTime();
    this.varSearch = "&qs={'and':[";

    if (this.terminalSelected !== null) {
      if (!this.searchCounter) this.searchCounter = true;
      if (this.terminalSelected === this.translate.instant('dpos.filter.all')) {
        this.varSearch += "{'or':[";
        for (let i = 1; i < this.terminalsNumber.length; i++) {
          this.varSearch += `{'field':'terminal_number','op':'=','value':'${this.terminalsNumber[i]}'}`;
          if (i + 1 < this.terminalsNumber.length) this.varSearch += ',';
        }
        this.varSearch += ']}';
      } else {
        this.varSearch += `{'field':'terminal_number','op':'=','value':'${this.terminalSelected}'}`;
      }
    }

    if (this.commerceId !== 0) {
      if (!this.searchCounter) this.searchCounter = true;
      else this.varSearch += ',';
      this.varSearch += `{'field':'CommerceId','op':'=','value':'${this.commerceId}'}`;
    }

    if (this.sinceDateMilli > 0) {
      if (this.sinceDateMilli > this.tilDateMilli && this.tilDateMilli > 0) {
        this.openModal(this.translate.instant('dpos.modal.fromDate.title'), this.translate.instant('dpos.modal.fromDate.message'));
        return;
      }
      if (!this.searchCounter) this.searchCounter = true;
      else this.varSearch += ',';
      this.varSearch += `{'field':'StartedAt','op':'>','value':'${this.sinceDateMilli}'}`;
    }

    if (this.tilDateMilli > 0) {
      if (this.tilDateMilli < this.sinceDateMilli && this.sinceDateMilli > 0) {
        this.openModal(this.translate.instant('dpos.filter.toDate.title'), this.translate.instant('dpos.filter.toDate.message'));
        return;
      }
      if (!this.searchCounter) this.searchCounter = true;
      else this.varSearch += ',';
      this.varSearch += `{'field':'FinishedAt','op':'<=','value':'${this.tilDateMilli}'}`;
    }

    if (this.terminalSelected !== null && this.sinceDateMilli === 0 && this.tilDateMilli === 0) {
      this.getBalanceInfo();
    }

    this.varSearch += ']}';
    this.searchCounter = false;
    this.getBalanceInfo();
  }

  /**
   * Redirige a la vista de detalles de cierres de caja con el ID encriptado.
   * 
   * @param id - Identificador del cierre de caja
   */
  public sendBalanceDetails(id: string): void {
    const encryptedId = this.encryptionService.encryptData(id);
    const route = '/balances-details/' + this.encryptionService.encode(encryptedId);
    this.router.navigate([route]);
  }

  /**
   * Descarga el listado de cierres de caja en formato CSV.
   */
  public downloadCSV(): void {
    this.downloadCsvService.downloadBalancesFile(
      this.balances,
      this.translate.instant('dpos.balances.page.title'),
      this.currentLang
    );
  }



  /**
   * Evento al cambiar la fecha "desde".
   */
  public onSinceDateChange(): void {
    this.sinceDate = (document.getElementById('sinceDate') as HTMLInputElement).value;
    if (this.sinceDate.length > 0) {
      this.sinceDateMilli = Date.parse(this.sinceDate);
    }
  }

  /**
   * Evento al cambiar la fecha "hasta".
   */
  public onTilDateChange(): void {
    this.tilDate = (document.getElementById('tilDate') as HTMLInputElement).value;
    if (this.tilDate.length > 0) {
      this.tilDateMilli = Date.parse(this.tilDate);
    }
  }

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
   * Cierra el modal de mensajes.
   */
  public closeModal(): void {
    this.showModal = false;
  }

  /**
   * Llama al servicio correspondiente para obtener la información de cierres de caja.
   */
  private getBalanceInfo(): void {
    this.loadCompleted = false;
    const size = 10000;
    const selectOperations = Array(3);

    this.balancesService.getBalanceInfo(size, this.varSearch).subscribe({
      next: (balanceInfo) => {
        this.balances = balanceInfo.data;
        if (this.balances.length) {
          for (let i = 0; i < 3; i++) {
            selectOperations[i] = Array(this.balances.length);
          }
          for (let i = 0; i < this.balances.length; i++) {
            const balance: Balance = this.balances[i];
            this.mismatch[i] = Math.abs(balance.manualCashRecount) - Math.abs(balance.autoCashRecount);
            let counterSelect = false;
            if (i === 0) {
              selectOperations[0][i] = balance.terminalNumber;
            } else {
              for (let z = 0; z <= i; z++) {
                if (selectOperations[0][z] === balance.terminalNumber || counterSelect) {
                  counterSelect = true;
                }
                if (!counterSelect && z === i) {
                  selectOperations[0][i] = balance.terminalNumber;
                }
              }
              counterSelect = false;
            }
            for (let j = this.balances.length - 1; j >= 0; j--) {
              if (selectOperations[0][j] === null) {
                selectOperations[0].splice(j, 1);
              }
            }
          }
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.balances'));
        if ([401, 500].includes(error.status)) {
          this.emptySearch = true;
          this.loadCompleted = true;
        }
      }
    });
  }

  /**
   * Convierte un timestamp a formato YYYY-MM-DD.
   * 
   * @param timestamp - Fecha en milisegundos
   * @returns Fecha formateada
   */
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
