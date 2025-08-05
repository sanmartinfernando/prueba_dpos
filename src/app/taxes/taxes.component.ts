import { StorageService } from 'src/app/_services/storage.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Component, OnInit } from '@angular/core';
import { PortalUsersService } from '../_services/portal-users.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Commerce } from '../_models/commerce.model';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { Tax } from '../_models/tax.model';
import { TaxesModalComponent } from './taxes-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'DPOSW-taxes',
  templateUrl: './taxes.component.html',
})
export class TaxesComponent implements OnInit {

  size: number = 10000;
  taxes: Tax[] = [{id:1, value:1000, name:"IVA 10%"}, {id:2, value:2100, name:"IVA 21%"}];
  page: number = 0;
  code: string;
  loadCompleted: boolean = false;
  commerceId: number = 0;

  masterSelected: boolean = false;

  //Parámetros de búsqueda
  public terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter: boolean = false;
  varSearch: string = null;

  emptySearch: boolean = false;
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';

  // Checkboxes
  selectedIndices: number[] = [];
  isAllSelected: boolean = false;
  counter = 0;

  currentLang: string;
  langSubscription: Subscription;

  commerceSelected: string;
  commerces: Commerce[];

  constructor(private downloadCsvService: DownloadCsvService,
    private storageService: StorageService,
    private portalUsersService: PortalUsersService,
    private dialog: MatDialog,
    private commercesService: CommercesService,
    private translate: TranslateService,
    private sessionService: SessionService,
    private themeService: ThemeService,
    private uiStateService: UIStateService,
    private authService: AuthService
  ) {  

    //Desbloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(true);

    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
    });
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadCompleted = false;

    this.storageService.userInfo.subscribe((user) =>{
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken)=> {
          this.authService.setPortalUsersToken(portalUserToken.token);
          this.commercesService.getCommerceList().subscribe({
            next: (commerces) => {
              this.commerces = commerces;
              this.sessionService.getCommerceId().subscribe((commerceId) => {
                if(commerceId != 0) {
                  this.commerceId = commerceId; // Actualizar el valor en el componente
                } else {
                  this.commerceId = commerces[0].commerceId;
                  this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
                }
                this.themeService.loadTheme(this.getCommerceResellerName(commerces));
                this.commerceSelected = this.getCommerceNumber(this.commerceId);
                this.searchTaxes();
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

  searchTaxes() {

    this.loadCompleted = false;
   
    //Comienzo query búsqueda
    this.varSearch = "&qs={'and':[";

    //Commerce id
    if (this.commerceId != 0) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch =
        this.varSearch +"{'field':'CommerceId','op':'=','value':'" +this.commerceId +"'}";
    }
    
    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;
    this.getTaxes();
  }

  private getTaxes() {
    this.loadCompleted = true;
    /*
    this.taxesService.getTaxes(this.size, this.varSearch).subscribe(
      (taxes) => {
        this.taxes = taxes.data;
        if(this.taxes.length != 0) {
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      (error) => {
        this.taxes = null;
        if (error.status == 401 || error.status == 404 ||  error.status == 500) {
          this.emptySearch = true;
          this.loadCompleted = true;
        };
      }
    );
    */
  }

  //Checkboxes
  selectAllTaxes() {
  for (const tax of this.taxes) {
      tax.selected = this.masterSelected;
    }
  }

  checkIfAllSelected() {
    this.masterSelected = this.taxes.every(c => c.selected);
  }

  //Eliminar impuestos
  deleteTaxes(){
    this.taxes = this.taxes.filter(tax => !tax.selected);
    if(this.taxes.length == 0) {
      this.emptySearch = true;
    }
  }
  
  //Añadir impuesto
  public openTaxesModal(id?: number): void {
    const dialogRef = this.dialog.open(TaxesModalComponent, {data: { id }});
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  //Descargar impuestos
  downloadCSV(){
    this.downloadCsvService.downloadTaxesFile(this.taxes, this.translate.instant('dpos.taxes.page.title'), this.currentLang);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onCommerceChange(): void {
    this.commerceId = this.getCommerceId();
    this.searchTaxes();
  }

  getCommerceId(): number {
    const commerce = this.commerces.find(commerce => commerce.commerceNumber == this.commerceSelected);
    if(commerce != undefined) {
      return commerce.commerceId;
    }
    return 0;
  }

  getCommerceNumber(commerceId:number): string {
    const commerce = this.commerces.find(commerce => commerce.commerceId == commerceId);
    if(commerce != undefined) {
      return commerce.commerceNumber;
    }
    return "";
  }

  private getCommerceResellerName(commerces: Commerce[]): string {
    const commerce = commerces.find(commerce => commerce.commerceId == this.commerceId);
    if(commerce != undefined) {
      return commerce.resellerName;
    }
    return null;
  }

  private parseCSV(csv: string): { rows: string[][], errors: string[] } {
    const rows: string[][] = [];
    const errors: string[] = [];
    let currentRow: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];

      if (char === '"') {
        if (insideQuotes && csv[i + 1] === '"') {
          currentValue += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentValue);
        currentValue = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && csv[i + 1] === '\n') i++;
        currentRow.push(currentValue);
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    if (currentValue !== '' || currentRow.length > 0) {
      currentRow.push(currentValue);
      rows.push(currentRow);
    }

    // Validación de filas incompletas
    const expectedLength = rows[0]?.length ?? 0;

    rows.forEach((row, index) => {
      if (row.length !== expectedLength) {
        errors.push(
          `Error en la fila ${index + 1}: se esperaban ${expectedLength} columnas pero hay ${row.length}.`
        );
      }
    });

    return { rows, errors };
  }
}
