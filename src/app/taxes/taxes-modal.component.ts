import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../_services/auth.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { Tax } from '../_models/tax.model';

@Component({
  selector: 'DPOSW-taxes-modal',
  templateUrl: './taxes-modal.component.html',
  styleUrls: [ ]
})
export class TaxesModalComponent {

  titlePage: string;
  idTax: number;
  taxFormData = {
    taxType: '-1',
    name: 'EXENTO',
    value: 0
  };
  
  Tax: Tax;
  isTaxNameDisabled:boolean = true;
  isTaxValueDisabled:boolean = true;

  constructor(public dialogRef: MatDialogRef<TaxesModalComponent>,
    private portalUsersService: PortalUsersService,
    private storageService: StorageService,
    private themeService: ThemeService,
    private sessionService: SessionService,
    private translate: TranslateService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { id?: number },
  ) { 
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idTax = data.id;
  }

  ngOnInit(): void {

    this.storageService.userInfo.subscribe((user) =>{
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken)=> {
          this.authService.setPortalUsersToken(portalUserToken.token);
          
          if (this.idTax) {
            this.titlePage = this.translate.instant('dpos.taxes.modal.title.edit');
            this.getTax();
          } else {
            this.titlePage = this.translate.instant('dpos.taxes.modal.title.add');
          }
        },
        error: (error) => {
          console.error("Error Portal user token", error);
        }
      });
    });
  }

  public updateTaxForm() {

    if(this.taxFormData.taxType === '-1' ) {
      this.taxFormData = {
          taxType: '-1',
          name: 'EXENTO',
          value: 0
        };
      this.isTaxNameDisabled = true;
      this.isTaxValueDisabled = true;
    } else if(this.taxFormData.taxType === '-2' ) {
      this.taxFormData = {
          taxType: '-2',
          name: 'NO SUJETO',
          value: 0
        };
      this.isTaxNameDisabled = true;
      this.isTaxValueDisabled = true;
    } else {
      this.taxFormData = {
          taxType: this.taxFormData.taxType,
          name: '',
          value: 0
        };
      this.isTaxNameDisabled = false;
      this.isTaxValueDisabled = false;
    }
  }

  public onSubmit() {
    this.dialogRef.close();
  }

  public close(): void {
    this.dialogRef.close();
  }

  private getTax() {
    this.loadTaxData();
  }

  private loadTaxData() {
    this.taxFormData = {
      taxType: '0',
      name: 'IVA 10%',
      value: 1000
    };
    this.isTaxNameDisabled = false;
    this.isTaxValueDisabled = false;
  }

  get taxValueDisplay(): string {
    return (this.taxFormData.value / 100).toFixed(2) + '%';
  }

  set taxValueDisplay(displayValue: string) {
    const clean = displayValue.replace('%', '').replace(',', '.');
    const parsed = parseFloat(clean);
    if (!isNaN(parsed)) {
      this.taxFormData.value = parsed * 100;
    }
  }
}