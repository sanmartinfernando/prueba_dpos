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
  productReferenceVarSearch: string = null;
  productBarcodeVarSearch: string = null;

  commerces: Commerce[];
  commerceId = 0;
  commerceSelected: string;

  currentCategoryPage = 1;
  categorySelected: string;
  categories: Category[] = [{categoryId: "0", name:""}];

  currentProductsPage = 1;
  products: Product[] = [
    { productId: "1", name: "Producto 1", price: 1000, reference: "Referencia 1", barcode: "Codigo de barras 1", stock: 10, type:0, favourite: true, categories: ["1", "2"], modifiers: ["1", "2"], epigraph:"Epígrafe 1", noticeKitchen: true, unitMeasurement: 0, noticeBar:true},
    { productId: "2", name: "Producto 2", price: 2000, reference: "Referencia 2", barcode: "Codigo de barras 2", stock: 20, type:0, favourite: true, categories: ["1", "2"], modifiers: ["1", "2"], epigraph:"Epígrafe 2", noticeKitchen: true, unitMeasurement: 0, noticeBar:true},
    { productId: "3", name: "Producto 3", price: 3000, reference: "Referencia 3", barcode: "Codigo de barras 3", stock: 30, type:0, favourite: true, categories: ["1", "2"], modifiers: ["1", "2"], epigraph:"Epígrafe 3", noticeKitchen: true, unitMeasurement: 0, noticeBar:true},
    { productId: "4", name: "Producto 4", price: 4000, reference: "Referencia 4", barcode: "Codigo de barras 4", stock: 40, type:0, favourite: true, categories: ["1", "2"], modifiers: ["1", "2"], epigraph:"Epígrafe 4", noticeKitchen: true, unitMeasurement: 0, noticeBar:true},
    { productId: "5", name: "Producto 5", price: 5000, reference: "Referencia 5", barcode: "Codigo de barras 5", stock: 50, type:0, favourite: true, categories: ["1", "2"], modifiers: ["1", "2"], epigraph:"Epígrafe 5", noticeKitchen: true, unitMeasurement: 0, noticeBar:true},
    { productId: "6", name: "Producto 6", price: 6000, reference: "Referencia 6", barcode: "Codigo de barras 6", stock: 60, type:0, favourite: true, categories: ["1", "2"], modifiers: ["1", "2"], epigraph:"Epígrafe 6", noticeKitchen: true, unitMeasurement: 0, noticeBar:true},
    { productId: "7", name: "Producto 7", price: 7000, reference: "Referencia 7", barcode: "Codigo de barras 7", stock: 70, type:0, favourite: true, categories: ["1", "2"], modifiers: ["1", "2"], epigraph:"Epígrafe 7", noticeKitchen: true, unitMeasurement: 0, noticeBar:true},
    { productId: "8", name: "Producto 8", price: 8000, reference: "Referencia 8", barcode: "Codigo de barras 8", stock: 80, type:0, favourite: true, categories: ["1", "2"], modifiers: ["1", "2"], epigraph:"Epígrafe 8", noticeKitchen: true, unitMeasurement: 0, noticeBar:true}
  ];

  currentLang: string;
  langSubscription: Subscription;
  validationVariable = false;
  searchCounter = false;
  varSearch: string = null;
  emptySearch = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  constructor() {
    this.uiStateService.setFormSelectEnabled(true);
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  /**
   * Inicializa la carga de datos, categorías y configuración inicial del componente.
   */
  ngOnInit(): void {
    this.loadCompleted = false;
    this.productNameVarSearch = this.sessionService.getItem(SessionService.PRODUCT_NAME) || null;
    this.productReferenceVarSearch = this.sessionService.getItem(SessionService.PRODUCT_REFERENCE) || null;
    this.productBarcodeVarSearch = this.sessionService.getItem(SessionService.PRODUCT_BARCODE) || null;

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
      error: error => console.error("Error Commerces: ", error)
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
  public onProductNameChange(): void {
    this.sessionService.setItem(SessionService.PRODUCT_NAME, this.productNameVarSearch);
  }

  /**
   * Guarda el valor de búsqueda de referencia del producto en la sesión.
   */
  public onProductReferenceChange(): void {
    this.sessionService.setItem(SessionService.PRODUCT_REFERENCE, this.productReferenceVarSearch);
  }

  /**
   * Guarda el valor de búsqueda de código de barras del producto en la sesión.
   */
  public onProductBarcodeChange(): void {
    this.sessionService.setItem(SessionService.PRODUCT_BARCODE, this.productBarcodeVarSearch);
  }

  /**
   * Limpia los campos de búsqueda y resetea valores en sesión.
   */
  public cleanFormFields(): void {
    this.productNameVarSearch = "";
    this.productReferenceVarSearch = "";
    this.productBarcodeVarSearch = "";
    this.sessionService.setItem(SessionService.CUSTOMER_NIF, "");
    this.sessionService.setItem(SessionService.CUSTOMER_NAME, "");
    this.sessionService.setItem(SessionService.CUSTOMER_LASTNAME, "");
  }

  /**
   * Genera la consulta de búsqueda y obtiene los productos.
   */
  public searchProducts() {
    this.validationVariable = false;
    this.loadCompleted = false;
    this.varSearch = "&qs={'and':[";
    const filters = [
      { field: 'CommerceId', value: this.commerceId },
      { field: 'name', value: this.productNameVarSearch },
      { field: 'reference', value: this.productReferenceVarSearch },
      { field: 'barcode', value: this.productBarcodeVarSearch }
    ];
    filters.forEach(filter => {
      if (filter.value !== null && filter.value !== "" && filter.value !== 0) {
        if (this.searchCounter) this.varSearch += ',';
        this.searchCounter = true;
        this.varSearch += `{'field':'${filter.field}','op':'=*.*','value':'${filter.value}'}`;
      }
    });
    this.varSearch += ']}';
    this.searchCounter = false;
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
   * Elimina un producto de la lista por su ID.
   */
  public deleteProduct(productId: string) {
    this.products = this.products.filter(p => p.productId !== productId);
    if (!this.products.length) this.emptySearch = true;
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
          reference: row[0],
          barcode: row[1],
          name: row[2],
          price: Number(row[3]),
          stock: Number(row[4]), type:0, 
          favourite: true, 
          categories: ["1", "2"], 
          modifiers: ["1", "2"], 
          epigraph:"Epígrafe 1", 
          noticeKitchen: true, 
          unitMeasurement: 0, 
          noticeBar:true
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
        this.categories.unshift(category);
        if (this.sessionService.getItem(SessionService.CATEGORY_ID) === null) {
          this.categorySelected = this.categories[0].categoryId;
          this.sessionService.setItem(SessionService.CATEGORY_ID, this.categories[0].categoryId);
        } else {
          this.categorySelected = this.categories.find(category => category.categoryId === this.sessionService.getItem(SessionService.CATEGORY_ID)).categoryId;
        }
      },
      error: () => {
        //TODO
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
    this.loadCompleted = true;
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
