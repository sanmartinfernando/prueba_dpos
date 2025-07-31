import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../_services/auth.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EncryptionService } from '../_services/encryption.service';
import { Tax } from '../_models/tax.model';
import { Category } from '../_models/category.model';

@Component({
  selector: 'DPOSW-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: [ ]
})
export class CategoryModalComponent {

  titlePage: string;
  idCategory: string;
  categoryFormData = {
    name: ''
  };
  
  Category: Category;

  constructor(
    private activatedRoute: ActivatedRoute,
    private encryptionService: EncryptionService,
    public dialogRef: MatDialogRef<CategoryModalComponent>,
    private portalUsersService: PortalUsersService,
    private storageService: StorageService,
    private themeService: ThemeService,
    private sessionService: SessionService,
    private translate: TranslateService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { id?: string },
  ) { 
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idCategory = data.id;
  }

  ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) =>{
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken)=> {
          this.authService.setPortalUsersToken(portalUserToken.token);
          if (this.idCategory) {
            this.titlePage = this.translate.instant('dpos.category.modal.title.edit');
            this.getTax();
          } else {
            this.titlePage = this.translate.instant('dpos.category.modal.title.add');
          }
        },
        error: (error) => {
          console.error("Error Portal user token", error);
        }
      });
    });
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
    this.categoryFormData = {
      name: 'Categoría X'
    };
  }
}