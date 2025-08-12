import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../_services/auth.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { Category } from '../_models/category.model';


@Component({
  selector: 'app-dpos-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: []
})
export class CategoryModalComponent implements OnInit {

  private portalUsersService = inject(PortalUsersService);
  private storageService = inject(StorageService);
  private themeService = inject(ThemeService);
  private sessionService = inject(SessionService);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);
  public dialogRef = inject(MatDialogRef<CategoryModalComponent>);
  public data = inject<{ id?: string }>(MAT_DIALOG_DATA);

  Category: Category;
  titlePage: string;
  idCategory: string;
  categoryFormData = {
    name: ''
  };

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idCategory = this.data.id;
  }

  ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
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