import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EncryptionService } from 'src/app/_services/encryption.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { PriceType, PriceTypeLabel, Product, UnitMeasurement, UnitMeasurementLabel } from '../../_models/product.model';
import { Category } from 'src/app/_models/category.model';
import { Modifiers } from '../../_models/modifiers.model';
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

  public productForm: FormGroup;

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
      categories: [[], [Validators.required, Validators.pattern(/^\bcategory:\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b$/)]],
      modifiers: ['', [Validators.required, Validators.pattern(/^\bmodifier:\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b$/)]],
      stock: ['', [Validators.required]],
      epigraph: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      barcode: ['',[Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      reference: ['',[Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      priceType: ['0', [Validators.required]],
      price: ['', [Validators.required]],
      taxes: ['',[Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      unitMeasurement: ['', [Validators.required]],
      description: ['',[Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,250}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]]
    });

    const initialPriceType = Number(this.productForm.get('priceType')?.value);
    const numericType = Number(initialPriceType);
    if (numericType === PriceType.Variable) {
      console.log("variable");
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
    this.productForm.get('priceType')?.valueChanges.subscribe(type => {
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
      } else {
        //TODO Error
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
   * Devuelve los nombres de las categorías seleccionadas en forma de cadena separada por comas.
   *
   * @returns {string} Cadena con los nombres de las categorías seleccionadas,
   *                   o una cadena vacía si no hay categorías seleccionadas.
   */
  public getSelectedCategoryNames(selectedIds: string[]): string {
    if (!selectedIds || selectedIds.length === 0) return '';
    return this.categories
      .filter(cat => selectedIds.includes(cat.categoryId))
      .map(cat => cat.name)
      .join(', ');
  }

  /**
   * Devuelve el nombre del modificador seleccionado.
   *
   * @returns {string} Nombre del modificador seleccionado,
   *                   o una cadena vacía si no hay modificador seleccionado.
   */
  public getSelectedModifiersName(selectedId: string): string {
    const mod = this.modifiers.find(m => m.modifierId === selectedId);
    return mod ? mod.name : '';
  }

  /**
   * Actualiza un producto existente.
   */
  private updateProduct(): void {
    this.setProductFields();
    /*
    this.productsService.saveProduct(this.product, this.commerceId).subscribe({
      next: () => this.code = '/products',
      error: () => this.code = '/products'
    });
    */
  }

  /**
   * Crea un nuevo producto.
   */
  private createProduct(): void {
    this.product = new Product();
    this.setProductFields();
    /*
    this.productsService.saveProduct(this.product, this.commerceId).subscribe({
      next: () => this.code = '/products',
      error: () => this.code = '/products'
    });
    */
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

  /**
   * Asigna los valores del formulario al objeto `Product`.
   */
  private setProductFields(): void {
    Object.assign(this.product, this.productForm.value);
  }
}
