import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { ProductsService } from '../_services/products.service';
import { Category } from '../_models/category.model';

/**
 * @class CategoryModalComponent
 * @description
 * Modal de gestión de categorías.
 * Permite crear, editar y guardar categorías.
 */
@Component({
  selector: 'app-dpos-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: []
})
export class CategoryModalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  public dialogRef = inject(MatDialogRef<CategoryModalComponent>);
  public data = inject<{ id?: string }>(MAT_DIALOG_DATA);

  titlePage: string;
  commerceId: string;
  category: Category;
  idCategory: string;
  categoryForm: FormGroup;

  savedCategory: Category;

  showModal = false;
  modalTitle = '';
  modalMessage = '';
  isLoading  = false;

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idCategory = this.data.id;
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ ]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
    });
  }

  /**
   * Inicializa el componente cargando datos del usuario y, si corresponde, la categoría a editar.
   */
  ngOnInit(): void {
    this.commerceId = this.sessionService.getItem(SessionService.COMMERCE_ID);
    if (this.idCategory) {
      this.getCategory(this.idCategory);
      this.titlePage = this.translate.instant('dpos.category.modal.title.edit');
    } else {
      this.titlePage = this.translate.instant('dpos.category.modal.title.add');
      this.isLoading  = false;
    }
  }

  /**
   * Cierra el modal sin realizar cambios.
   */
  public close(): void {
    this.dialogRef.close();
  }

  /**
   * Obtiene una categoría existente y carga sus datos en el formulario.
   * 
   * @param categoryId Identificador de la categoría.
   */
  public getCategory(categoryId: string): void {
    this.isLoading = true;
    this.productsService.getCategory(categoryId, this.commerceId).subscribe({
      next: (category) => {
        this.category = category;
        this.categoryForm.setValue({ name: this.category.categoryName });
        this.isLoading = false;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.category'));
        this.isLoading = false;
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
    this.dialogRef.close(this.savedCategory);
  }
  
  /**
   * Actualiza una categoría existente.
   */
  private updateCategory(): void {
    this.setCategoryFields();
    this.isLoading = true;
    this.productsService.saveCategory(this.category, this.commerceId).subscribe({
      next: (savedCategory) => {
        this.openModal(this.translate.instant('dpos.category.modal.modal.edit.title'), this.translate.instant('dpos.category.modal.modal.edit.message'));
        this.savedCategory = savedCategory;
        this.isLoading = false;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.category.update'));
        this.savedCategory = null;
        this.isLoading = false;
      }
    });
  }

  /**
   * Crea una nueva categoría.
   */
  private createCategory(): void {
    this.category = new Category();
    this.setCategoryFields();
    this.isLoading = true;
    this.productsService.saveCategory(this.category, this.commerceId).subscribe({
      next: (savedCategory) => {
        this.openModal(this.translate.instant('dpos.category.modal.modal.create.title'), this.translate.instant('dpos.category.modal.modal.create.message'));
        this.savedCategory = savedCategory;
        this.isLoading = false;
      },
       error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.category.create'));
        this.savedCategory = null;
        this.isLoading = false;
      }
    });
  }

  /**
   * Asigna al modelo de categoría los valores actuales del formulario.
   */
  private setCategoryFields(): void {
    this.category.categoryName = this.categoryForm.get('categoryName').value;
  }
}
