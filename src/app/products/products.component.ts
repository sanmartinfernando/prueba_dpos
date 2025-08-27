import { Component, ElementRef, OnInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { EncryptionService } from '../_services/encryption.service';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { CommercesService } from '../_services/commerces.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Commerce } from '../_models/commerce.model';
import { Product } from '../_models/product.model';
import { Category } from '../_models/category.model';
import { ProductsService } from '../_services/products.service';

/**
 * @class ProductsComponent
 * @description
 * Componente para la gestión de productos:
 * permite búsqueda, filtrado, importación, exportación y manipulación de datos de productos.
 */
@Component({
  selector: 'app-dpos-products',
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit, OnDestroy {

  private encryptionService = inject(EncryptionService);
  private downloadCsvService = inject(DownloadCsvService);
  private commercesService = inject(CommercesService);
  private translate = inject(TranslateService);
  private uiStateService = inject(UIStateService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private productsService = inject(ProductsService);
  private router = inject(Router);

  @ViewChild('productFileInput') productFileInput!: ElementRef<HTMLInputElement>;

  loadCompleted = false;
  size = 10000;
  Math = Math;

  productNameVarSearch: string = null;
  productFavouriteVarSearch = false;

  commerces: Commerce[];
  commerceId = 0;
  commerceSelected: string;

  currentCategoryPage = 1;
  categorySelected: string;
  categories: Category[] = [{categoryId: "0", name:""}];

  currentProductsPage = 1;
  products: Product[] = [];

  currentLang: string;
  langSubscription: Subscription;
  validationVariable = false;
  searchCounter = false;
  varSearch: string = null;
  emptySearch = false;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showAcceptButton = false;
  showCancelButton = false;

  // Guardamos la acción a ejecutar al aceptar en el modal
  acceptAction: (() => void) | null = null;

  constructor() {
    this.uiStateService.setFormSelectEnabled(true);
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.categories = this.categories.map(c => {
        if (c.categoryId === "0") {
          return { ...c, name: this.translate.instant('dpos.filter.all') };
        }
        return c;
      });
    });
  }

  /**
   * Inicializa la carga de datos, categorías y configuración inicial del componente.
   */
  ngOnInit(): void {
    this.loadCompleted = false;
    this.productNameVarSearch = this.sessionService.getItem(SessionService.PRODUCT_NAME) || null;

    this.commercesService.getCommerceList().subscribe({
      next: commerces => {
        this.commerces = commerces;
        this.sessionService.getCommerceId().subscribe(commerceId => {
          this.commerceId = commerceId !== 0 ? commerceId : commerces[0].commerceId;
          if (commerceId === 0) {
            this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
          }
          this.themeService.loadTheme(this.getCommerceResellerName(commerces));
          this.commerceSelected = this.getCommerceNumber(this.commerceId);
          this.getAllCategories();
          this.searchProducts();
        });
      },
      error: error => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.commerces'));
        console.error("Error Commerces: ", error);
      }
    });
  }

  /**
   * Libera recursos al destruir el componente.
   */
  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  /**
   * Guarda el valor de búsqueda del nombre del producto en la sesión.
   */
  public onCategoryChange(): void {
    this.sessionService.setItem(SessionService.PRODUCT_CATEGORY, this.categorySelected);
  }

  /**
   * Guarda el valor de búsqueda del nombre del producto en la sesión.
   */
  public onProductNameChange(): void {
    this.sessionService.setItem(SessionService.PRODUCT_NAME, this.productNameVarSearch);
  }

  public onProductFavouriteChange(value: boolean): void {
    this.productFavouriteVarSearch = value;
    this.sessionService.setItem(SessionService.PRODUCT_FAVOURITE, this.productFavouriteVarSearch);
  }

  /**
   * Limpia los campos de búsqueda y resetea valores en sesión.
   */
  public cleanFormFields(): void {
    this.productNameVarSearch = "";
    this.productFavouriteVarSearch = false;
    this.sessionService.setItem(SessionService.PRODUCT_NAME, "");
    this.sessionService.setItem(SessionService.PRODUCT_FAVOURITE, false);
  }

  /**
   * Genera la consulta de búsqueda y obtiene los productos.
   */
  public searchProducts() {
    this.loadCompleted = false;

    const filters = [
      { field: 'name', value: this.productNameVarSearch, op: '=*.*' },
      { field: 'favourite', value: this.productFavouriteVarSearch, op: '=' }
    ].filter(f => f.value);

    
    // Construimos el objeto "qs"
    const qsObject = filters.length > 0 ? { or: filters } : null;
    this.varSearch = qsObject ? JSON.stringify(qsObject) : null;
    this.getProducts();
  }

  /**
   * Inicia el flujo para agregar un nuevo producto.
   */
  public addProduct() {
    this.sendProductDetails(null);
  }

  /**
   * Envía los detalles de un producto, con cifrado si aplica.
   */
  public sendProductDetails(id: string) {
    const code = !id
      ? '/product-details'
      : `/product-details/${this.encryptionService.encode(this.encryptionService.encryptData(id))}`;

    this.router.navigate([code]);
  }

  /**
   * Descarga el listado de productos en formato CSV.
   */
  public downloadCSV() {
    this.downloadCsvService.downloadProductsFile(this.products, this.translate.instant('dpos.products.page.title'), this.currentLang);
  }

  /**
   * Abre el selector de archivos para importar productos.
   */
  public importProducts() {
    this.productFileInput.nativeElement.click();
  }

  /**
   * Procesa el archivo CSV de productos.
   */
  public onProductFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const { rows, errors } = this.parseCSV(text);
      //TODO
      if (!errors.length) {
        const products: Product[] = rows.map((row, i) => ({
          productId: i.toString(),
          name: row[0],
          price: Number(row[1]),
          stock: Number(row[2]), 
          type:0, 
          favourite: true, 
          categoryId: "1", 
          modifiers: ["1", "2"], 
          epigraph:"Epígrafe 1", 
          noticeKitchen: true, 
          unitMeasurement: 0, 
          noticeBar:true,
          decimals:2
        }));
        this.showModal = true;
        this.modalTitle = 'Importación de productos';
        this.modalMessage = 'Productos importados correctamente';
        this.products = [...(this.products || []), ...products];
        if (this.products.length) this.emptySearch = false;
      }
    };
    reader.readAsText(file);
  }

  /**
   * Elimina un producto de la lista por su ID.
   */
  public deleteProduct(productId: string) {
    console.log("paso por aqui");
    this.loadCompleted = false;
    this.productsService.deleteProduct(productId, this.commerceId.toString()).subscribe({
      next: () => {
        this.showModal = false; 
        this.loadCompleted = true;
        this.searchProducts();
        this.openModal(this.translate.instant('dpos.product-details.modal.delete.title'), this.translate.instant('dpos.product-details.modal.delete.message'));
      },
      error: () => {
        this.showModal = false;
        this.loadCompleted = true;
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.product.delete'));
      }
    });
  }

  /** Abrir modal para eliminar */
  openDeleteModal(productId: string, event: MouseEvent) {
    event.stopPropagation();
    this.showAcceptButton = true;
    this.showCancelButton = true;
    this.modalTitle = this.translate.instant('dpos.action.confirm')
    this.modalMessage = this.translate.instant('dpos.product-details.modal.delete.confirm');
    this.acceptAction = () => this.deleteProduct(productId);
    this.showModal = true;
  }

  /** Acción genérica al aceptar modal */
  onAcceptModal() {
    if (this.acceptAction) {
      this.acceptAction();
      this.acceptAction = null;
    }
    this.showModal = false;
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
    this.showAcceptButton = false;
    this.showCancelButton = false;
    this.showModal = true;
  }
  
  /**
   * Cierra el modal de mensajes.
   */
  public closeModal() {
    this.showModal = false;
  }

  /**
   * Devuelve el listado de categorías para el comercio seleccionado.
   */
  private getAllCategories() {
    this.productsService.getAllCategories(this.commerceId.toString()).subscribe({
      next: (categories) => {
        this.categories = categories;
        const category: Category = {categoryId: "0", name: this.translate.instant('dpos.filter.all')};
        this.categories.unshift(category);;
        if (this.sessionService.getItem(SessionService.PRODUCT_CATEGORY) == null) {
          this.categorySelected = this.categories[0].categoryId;
          this.sessionService.setItem(SessionService.PRODUCT_CATEGORY, this.categories[0].categoryId);
        } else {
          this.categorySelected = this.categories.find(category => category.categoryId === this.sessionService.getItem(SessionService.PRODUCT_CATEGORY)).categoryId;
        }
      },
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.category.all'));
        console.error("Error all categories", error);
      }
    });
  }

  /**
   * Devuelve el número de comercio según su ID.
   */
  private getCommerceNumber(commerceId: number): string {
    return this.commerces.find(c => c.commerceId === commerceId)?.commerceNumber || "";
  }

  /**
   * Obtiene el nombre del comercio para el comercio actual.
   */
  private getCommerceResellerName(commerces: Commerce[]): string {
    return commerces.find(c => c.commerceId === this.commerceId)?.resellerName || null;
  }

  /**
   * Obtiene los productos a través de la llamada al servicio correspondiente.
   */
  private getProducts() {
    this.emptySearch = true;
    this.loadCompleted = false;

    this.productsService.getProducts(this.size, this.commerceId.toString(), this.varSearch).subscribe({
      next: products => {
        this.products = products.data;
        this.emptySearch = this.products.length === 0;
        this.loadCompleted = true;
      },
      error: () => {
        this.products = [];
        this.emptySearch = true;
        this.loadCompleted = true;
      }
    });
  }

  /**
   * Parsea un texto CSV a un array de filas y valida su consistencia.
   */
  private parseCSV(csv: string): { rows: string[][]; errors: string[] } {
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

    if (currentValue || currentRow.length) {
      currentRow.push(currentValue);
      rows.push(currentRow);
    }

    const expectedLength = rows[0]?.length ?? 0;
    rows.forEach((row, index) => {
      if (row.length !== expectedLength) {
        errors.push(`Error en la fila ${index + 1}: se esperaban ${expectedLength} columnas pero hay ${row.length}.`);
      }
    });

    return { rows, errors };
  }
}
