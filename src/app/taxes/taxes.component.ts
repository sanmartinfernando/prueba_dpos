import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { DownloadCsvService } from '../_services/download-csv.service';
import { CommercesService } from '../_services/commerces.service';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { Commerce } from '../_models/commerce.model';
import { Tax } from '../_models/tax.model';
import { TaxesModalComponent } from './taxes-modal.component';

/**
 * @class TaxesComponent
 * @description
 * Componente encargado de gestionar la visualización, filtrado, edición, eliminación
 * y descarga de impuestos.
 */
@Component({
  selector: 'app-dpos-taxes',
  templateUrl: './taxes.component.html',
})
export class TaxesComponent implements OnInit, OnDestroy {

  private downloadCsvService = inject(DownloadCsvService);
  private dialog = inject(MatDialog);
  private commercesService = inject(CommercesService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);
  private uiStateService = inject(UIStateService);

  size = 10000;
  taxes: Tax[] = [
    { id: 1, value: 1000, name: "IVA 10%" },
    { id: 2, value: 2100, name: "IVA 21%" }
  ];
  page = 0;
  code: string;
  loadCompleted = false;
  commerceId = 0;

  masterSelected = false;

  terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter = false;
  varSearch: string = null;

  emptySearch = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  selectedIndices: number[] = [];
  isAllSelected = false;
  counter = 0;

  currentLang: string;
  langSubscription: Subscription;

  commerceSelected: string;
  commerces: Commerce[];

  constructor() {
    this.uiStateService.setFormSelectEnabled(true);
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
    });
  }

  /**
   * Cancela la suscripción del listener de cambio de idioma al destruir el componente.
   */
  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  /**
   * Inicializa el componente cargando comercios, tokens y configuraciones de sesión.
   */
  ngOnInit(): void {
    this.loadCompleted = false;
    this.commercesService.getCommerceList().subscribe({
      next: commerces => {
        this.commerces = commerces;
        this.sessionService.getCommerceId().subscribe(commerceId => {
          this.commerceId = commerceId !== 0 ? commerceId : commerces[0].commerceId;
          if (commerceId === 0) {
            this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
          }
          this.themeService.loadTheme(this.getCommerceResellerName(commerces));
          this.commerceSelected = this.getCommerceNumber(this.commerceId);
          this.searchTaxes();
        });
      },
      error: error => console.error("Error Commerces: ", error)
    });
  }

  /**
   * Verifica si todos los impuestos están seleccionados.
   */
  public checkIfAllSelected() {
    this.masterSelected = this.taxes.every(c => c.selected);
  }

  /**
   * Elimina los impuestos seleccionados.
   */
  public deleteTaxes() {
    this.taxes = this.taxes.filter(tax => !tax.selected);
    if (this.taxes.length === 0) {
      this.emptySearch = true;
    }
  }

  /**
   * Abre el modal para agregar o editar un impuesto.
   * 
   * @param id Identificador del impuesto a editar (opcional).
   */
  public openTaxesModal(id?: number): void {
    const dialogRef = this.dialog.open(TaxesModalComponent, { data: { id } });
    dialogRef.afterClosed();
  }

  /**
   * Descarga la lista de impuestos en formato CSV.
   */
  public downloadCSV() {
    this.downloadCsvService.downloadTaxesFile(
      this.taxes,
      this.translate.instant('dpos.taxes.page.title'),
      this.currentLang
    );
  }

  /**
   * Cierra el modal de mensajes.
   */
  public closeModal() {
    this.showModal = false;
  }

  /**
   * Genera la query de búsqueda de impuestos y lanza la obtención de resultados.
   */
  private searchTaxes() {
    this.loadCompleted = false;
    this.varSearch = "&qs={'and':[";
    if (this.commerceId !== 0) {
      if (this.searchCounter) {
        this.varSearch += ',';
      } else {
        this.searchCounter = true;
      }
      this.varSearch += `{'field':'CommerceId','op':'=','value':'${this.commerceId}'}`;
    }
    this.varSearch += ']}';
    this.searchCounter = false;
    this.getTaxes();
  }

  /**
   * Obtiene la lista de impuestos.
   */
  private getTaxes() {
    this.loadCompleted = true;
  }

  /**
   * Obtiene el número de comercio dado un ID.
   */
  private getCommerceNumber(commerceId: number): string {
    const commerce = this.commerces.find(c => c.commerceId === commerceId);
    return commerce ? commerce.commerceNumber : "";
  }

  /**
   * Obtiene el nombre del reseller de un comercio.
   */
  private getCommerceResellerName(commerces: Commerce[]): string {
    const commerce = commerces.find(c => c.commerceId === this.commerceId);
    return commerce ? commerce.resellerName : null;
  }
}
