import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/_services/auth.service';
import { EncryptionService } from 'src/app/_services/encryption.service';
import { PortalUsersService } from 'src/app/_services/portal-users.service';
import { SessionService } from 'src/app/_services/session.service';
import { StorageService } from 'src/app/_services/storage.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { Product } from '../../_models/product.model';
import { Category } from 'src/app/_models/category.model';
import { Modifiers } from '../../_models/modifiers.model';
import { CategoryModalComponent } from 'src/app/categories/category-modal.component';
import { ModifiersModalComponent } from 'src/app/modifiers/modifiers-modal.component';
import { ProductsService } from 'src/app/_services/products.service';

/**
 * Componente que gestiona la vista y edición de detalles de un producto,
 * permitiendo su creación, actualización y asignación de categorías y modificadores.
 */
@Component({
  selector: 'app-dpos-product-details',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {

  private authService = inject(AuthService);
  private encryptionService = inject(EncryptionService);
  private portalUsersService = inject(PortalUsersService);
  private sessionService = inject(SessionService);
  private storageService = inject(StorageService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private activatedRoute = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private productsService = inject(ProductsService);
  private dialog = inject(MatDialog);

  public loadCompleted = false;
  public idProduct: string = null;
  public titlePage: string;
  public code: string;
  public product: Product;
  public categoryIdSelected: string[] = [];
  public modifiersIdSelected: string;
  public salesStartDate: string;
  public salesStartDateMilli: number;
  public salesEndDate: string;
  public salesEndDateMilli: number;

  public categories: Category[] = [];
  public commerceId: string = null;

  public modifiers: Modifiers[] = [];

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.uiStateService.setFormSelectEnabled(false);
  }

  /**
   * Inicializa el componente obteniendo información del producto si existe.
   */
  ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
          this.authService.setPortalUsersToken(portalUserToken.token);
          this.commerceId = this.sessionService.getItem(SessionService.COMMERCE_ID);
          const idParam = this.activatedRoute.snapshot.params['id'];
          if (idParam) {
            this.idProduct = this.encryptionService.decode(idParam);
            this.titlePage = this.translate.instant('dpos.product-details.page.edit.title');
            this.getProduct();
          } else {
            this.titlePage = this.translate.instant('dpos.product-details.page.add.title');
          }
          this.getAllCategories();
          this.getAllModifiers();
          this.loadCompleted = true;
        },
        error: (error) => {
          console.error('Error Portal user token', error);
        }
      });
    });
  }

  /**
   * Obtiene la información de un producto.
   */
  public getProduct(): void {
    // Implementación pendiente
  }

  /**
   * Abre el modal de categorías.
   * @param id - ID de la categoría para edición.
   */
  public openCategoriesModal(id?: string): void {
    const dialogRef = this.dialog.open(CategoryModalComponent, { data: { id } });
    dialogRef.afterClosed().subscribe(category => {
      if (category) {
        this.getAllCategories();
      } else {
        //TODO Error
      }
    });
  }

  /**
   * Abre el modal de modificadores.
   * @param id - ID del modificador para edición.
   */
  public openModifiersModal(id?: string): void {
    const dialogRef = this.dialog.open(ModifiersModalComponent, { data: { id } });
    dialogRef.afterClosed().subscribe(modifier => {
      if (modifier) {
        this.getAllModifiers();
      } else {
        //TODO Error
      }
    });
  }

  /**
   * Abre la acción de edición para una categoría sin disparar la selección en el mat-select.
   *
   * @param categoryId - ID de la categoría seleccionada que se desea editar.
   * @param event - Evento del clic en el botón de editar. Se detiene la propagación
   *                para evitar que el mat-option cambie el estado de selección.
   */
  public editCategory(categoryId: string, event: MouseEvent) {
    event.stopPropagation();
    this.openCategoriesModal(categoryId);
  }

  /**
   * Abre la acción de edición para un modificador sin disparar la selección en el mat-select.
   *
   * @param modifierId - ID del modificador seleccionado que se desea editar.
   * @param event - Evento del clic en el botón de editar. Se detiene la propagación
   *                para evitar que el mat-option cambie el estado de selección.
   */
  public editModifier(modifierId: string, event: MouseEvent) {
    event.stopPropagation();
    this.openModifiersModal(modifierId);
  }

  /**
   * Guarda el producto actual, ya sea creándolo o actualizándolo.
   */
  public saveProduct(): void {
    if (this.product) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  /**
   * Devuelve los nombres de las categorías seleccionadas en forma de cadena separada por comas.
   *
   * @returns {string} Cadena con los nombres de las categorías seleccionadas,
   *                   o una cadena vacía si no hay categorías seleccionadas.
   */
  public getSelectedCategoryNames(): string {
    if (!this.categoryIdSelected || this.categoryIdSelected.length === 0) {
      return '';
    }
    return this.categories
      .filter(c => this.categoryIdSelected.includes(c.categoryId))
      .map(c => c.name)
      .join(', ');
  }

  /**
   * Devuelve el nombre del modificador seleccionado.
   *
   * @returns {string} Nombre del modificador seleccionado,
   *                   o una cadena vacía si no hay modificador seleccionado.
   */
  public getSelectedModifiersName(): string {
    if (!this.modifiersIdSelected) {
      return '';
    }
    const modifier = this.modifiers.find(m => m.modifierId === this.modifiersIdSelected);
    return modifier ? modifier.name : '';
  }

  /**
   * Actualiza un producto existente.
   */
  private updateProduct(): void {
    this.code = '/products';
  }

  /**
   * Crea un nuevo producto.
   */
  private createProduct(): void {
    this.code = '/products';
  }

  /**
   * Devuelve el listado de categorías para el comercio seleccionado.
   */
  private getAllCategories() {
    this.productsService.getAllCategories(this.commerceId.toString()).subscribe({
      next: (categories) => {
        this.categories = categories;
        const category: Category = {categoryId: "0", name: this.translate.instant('dpos.filter.all')};
        this.categories.unshift(category);
      },
      error: () => {
        //TODO
      }
    });
  }

  /**
   * Devuelve el listado de modificadores para el comercio seleccionado.
   */
  private getAllModifiers() {
    this.productsService.getAllModifiers(this.commerceId.toString()).subscribe({
      next: (modifiers) => {
        this.modifiers = modifiers;
      },
      error: () => {
        //TODO
      }
    });
  }
}
