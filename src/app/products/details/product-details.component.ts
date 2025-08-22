import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EncryptionService } from 'src/app/_services/encryption.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { PriceType, PriceTypeLabel, Product, UnitMeasurement, UnitMeasurementLabel } from '../../_models/product.model';
import { Category } from 'src/app/_models/category.model';
import { Modifier } from '../../_models/modifiers.model';
import { CategoryModalComponent } from 'src/app/categories/category-modal.component';
import { ModifiersModalComponent } from 'src/app/modifiers/modifiers-modal.component';
import { ProductsService } from 'src/app/_services/products.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * @class ProductDetailsComponent
 * @description
 * Componente que gestiona la vista y edición de detalles de un producto,
 * permitiendo su creación, actualización y asignación de categorías y modificadores.
 */
@Component({
  selector: 'app-dpos-product-details',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {

  private fb = inject(FormBuilder);
  private encryptionService = inject(EncryptionService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private activatedRoute = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private productsService = inject(ProductsService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  public loadCompleted = false;
  public idProduct: string = null;
  public titlePage: string;
  public product: Product;
  public categoryIdSelected: string[] = [];
  public modifiersIdSelected: string;
  public salesStartDate: string;
  public salesStartDateMilli: number;
  public salesEndDate: string;
  public salesEndDateMilli: number;

  public categories: Category[] = [];
  public commerceId: string = null;

  public modifiers: Modifier[] = [];

  public productForm: FormGroup;

  public showModal = false;
  public modalTitle = '';
  public modalMessage = '';

  public unitMeasurementOptions = Object.values(UnitMeasurement)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as UnitMeasurement,
      label: UnitMeasurementLabel[value as UnitMeasurement]
    }));

  public priceTypeOptions = Object.values(PriceType)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as PriceType,
      label: PriceTypeLabel[value as PriceType]
    }));
    
  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.uiStateService.setFormSelectEnabled(false);

    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      price: [0, [Validators.required, Validators.min(0)]],
      type: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
      categoryId: ['', [Validators.required, Validators.pattern(/^\bcategory:\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b$/)]],
      modifiers: [[], [Validators.required, Validators.pattern(/^\bmodifier:\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b$/)]],
      epigraph: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      unitMeasurement: [0, [Validators.required, Validators.min(0), Validators.max(3)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });

    const initialPriceType = Number(this.productForm.get('type')?.value);
    const numericType = Number(initialPriceType);
    if (numericType === PriceType.Variable) {
      this.productForm.get('price')?.reset();
      this.productForm.get('price')?.disable();
      this.productForm.get('price')?.setValue(0);
    } else {
      this.productForm.get('price')?.enable();
      this.productForm.get('price')?.setValue(null);
    }
  }

  /**
   * Inicializa el componente obteniendo información del producto si existe.
   */
  ngOnInit(): void {
    this.productForm.get('type')?.valueChanges.subscribe(type => {
      const numericType = Number(type);
      if (numericType === PriceType.Variable) {
        this.productForm.get('price')?.reset();
        this.productForm.get('price')?.disable();
        this.productForm.get('price')?.setValue(0);
      } else {
        this.productForm.get('price')?.enable();
        this.productForm.get('price')?.setValue(null);
      }
    });
    
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
  }

  /**
   * Obtiene la información de un producto.
   */
  public getProduct(): void {
    // Implementación pendiente
  }

  /**
   * Abre el modal de categorías.
   * 
   * @param id - ID de la categoría para edición.
   */
  public openCategoriesModal(id?: string): void {
    const dialogRef = this.dialog.open(CategoryModalComponent, { data: { id } });
    dialogRef.afterClosed().subscribe(category => {
      if (category) {
        this.getAllCategories();
      }
    });
  }

  /**
   * Abre el modal de modificadores.
   * 
   * @param id - ID del modificador para edición.
   */
  public openModifiersModal(id?: string): void {
    const dialogRef = this.dialog.open(ModifiersModalComponent, { data: { id } });
    dialogRef.afterClosed().subscribe(modifier => {
      if (modifier) {
        this.getAllModifiers();
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
   * Envía el formulario de producto, y volvemos a la pantalla de listado de productos.
   */
  public saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    if (this.product) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  /**
   * Devuelve los nombres de los modificadores seleccionados en forma de cadena separada por comas.
   *
   * @returns {string} Cadena con los nombres de los modificadores seleccionados,
   *                   o una cadena vacía si no se ha seleccionado ningún modificador.
   */
  public getSelectedModifiersName(selectedIds: string[]): string {
    if (!selectedIds || selectedIds.length === 0) return '';
    return this.modifiers
      .filter(mod => selectedIds.includes(mod.modifierId))
      .map(mod => mod.name)
      .join(', ');
  }

  /**
   * Devuelve el nombre de la categoría seleccionada.
   *
   * @returns {string} Nombre de la categoría seleccionada,
   *                   o una cadena vacía si no se ha seleccionado una categoría.
   */
  public getSelectedCategoryNames(selectedId: string): string {
    const cat = this.categories.find(c => c.categoryId === selectedId);
    return cat ? cat.name : '';
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
  public closeModal() {
    this.showModal = false;
    this.router.navigate(['/products']);
  }

  /**
   * Actualiza un producto existente.
   */
  private updateProduct(): void {
    this.setProductFields();
    this.productsService.saveProduct(this.product, this.commerceId).subscribe({
      next: () => this.openModal(this.translate.instant('dpos.product-details.modal.edit.title'), this.translate.instant('dpos.product-details.modal.edit.message')),
      error: () => this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.product.update'))
    });
  }

  /**
   * Crea un nuevo producto.
   */
  private createProduct(): void {
    this.product = new Product();
    this.setProductFields();
    this.productsService.saveProduct(this.product, this.commerceId).subscribe({
      next: () => this.openModal(this.translate.instant('dpos.product-details.modal.create.title'), this.translate.instant('dpos.product-details.modal.create.message')),
      error: () => this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.product.create'))
    });
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
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.category.all'));
        console.error("Error all categories", error);
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
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.modifiers.all'));
        console.error("Error all modifiers", error);
      }
    });
  }

  /**
   * Asigna los valores del formulario al objeto `Product`.
   */
  private setProductFields(): void {
    Object.assign(this.product, this.productForm.value);
  }
}
