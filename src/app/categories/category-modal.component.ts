import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../_services/auth.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { ProductsService } from '../_services/products.service';
import { Category } from '../_models/category.model';

/**
 * Modal de gestión de categorías.
 * Permite crear, editar y guardar categorías.
 */
@Component({
  selector: 'app-dpos-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: []
})
export class CategoryModalComponent implements OnInit {

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private portalUsersService = inject(PortalUsersService);
  private productsService = inject(ProductsService);
  private sessionService = inject(SessionService);
  private storageService = inject(StorageService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  public dialogRef = inject(MatDialogRef<CategoryModalComponent>);
  public data = inject<{ id?: string }>(MAT_DIALOG_DATA);

  titlePage: string;
  loadCompleted = false;
  commerceId: string;
  category: Category;
  idCategory: string;
  categoryForm: FormGroup;

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idCategory = this.data.id;
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
    });
  }

  /**
   * Inicializa el componente cargando datos del usuario y, si corresponde, la categoría a editar.
   */
  ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
          this.authService.setPortalUsersToken(portalUserToken.token);
          this.commerceId = this.sessionService.getItem(SessionService.COMMERCE_ID);
          if (this.idCategory) {
            this.getCategory(this.idCategory);
            this.titlePage = this.translate.instant('dpos.category.modal.title.edit');
          } else {
            this.titlePage = this.translate.instant('dpos.category.modal.title.add');
            this.loadCompleted = true;
          }
        },
        error: (error) => {
          console.error('Error Portal user token', error);
        }
      });
    });
  }

  /**
   * Cierra el modal sin realizar cambios.
   */
  public close(): void {
    this.dialogRef.close();
  }

  /**
   * Obtiene una categoría existente y carga sus datos en el formulario.
   * @param categoryId Identificador de la categoría.
   */
  public getCategory(categoryId: string): void {
    this.productsService.getCategory(categoryId, this.commerceId).subscribe({
      next: (category) => {
        this.category = category;
        this.categoryForm.setValue({ name: this.category.name });
        this.loadCompleted = true;
      },
      error: () => {
        this.loadCompleted = true;
      }
    });
  }

  /**
   * Guarda los cambios de la categoría, ya sea creándola o actualizándola.
   */
  public saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    if (this.category) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  /**
   * Actualiza una categoría existente.
   */
  private updateCategory(): void {
    this.setCategoryFields();
    this.productsService.saveCategory(this.category, this.commerceId).subscribe({
      next: (savedCategory) => this.dialogRef.close(savedCategory),
      error: () => this.dialogRef.close(null)
    });
  }

  /**
   * Crea una nueva categoría.
   */
  private createCategory(): void {
    this.category = new Category();
    this.setCategoryFields();
    this.productsService.saveCategory(this.category, this.commerceId).subscribe({
      next: (savedCategory) => this.dialogRef.close(savedCategory),
      error: () => this.dialogRef.close(null)
    });
  }

  /**
   * Asigna al modelo de categoría los valores actuales del formulario.
   */
  private setCategoryFields(): void {
    this.category.name = this.categoryForm.get('name').value;
  }
}
