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

  public categories: Category[] = [
    { categoryId: '0', name: 'Todas las categorías' },
    { categoryId: '1', name: 'Categoria 1' },
    { categoryId: '2', name: 'Categoria 2' }
  ];

  public modifiers: Modifiers[] = [
    { id: '0', name: 'Punto de la carne', modifiers: 'muy hecho, hecho, al punto, crudo' }
  ];

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
          const idParam = this.activatedRoute.snapshot.params['id'];
          if (idParam) {
            this.idProduct = this.encryptionService.decode(idParam);
            this.titlePage = this.translate.instant('dpos.product-details.page.edit.title');
            this.getProduct();
          } else {
            this.titlePage = this.translate.instant('dpos.product-details.page.add.title');
          }
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
    dialogRef.afterClosed();
  }

  /**
   * Abre el modal de modificadores.
   * @param id - ID del modificador para edición.
   */
  public openModifiersModal(id?: string): void {
    const dialogRef = this.dialog.open(ModifiersModalComponent, { data: { id } });
    dialogRef.afterClosed();
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
}
