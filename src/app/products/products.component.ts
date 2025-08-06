import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncryptionService } from '../_services/encryption.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { CommercesService } from '../_services/commerces.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { AuthService } from '../_services/auth.service';
import { Commerce } from '../_models/commerce.model';
import { Product } from '../_models/product.model';
import { Category } from '../_models/category.model';
import { CategoryModalComponent } from '../categories/category-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { DownloadCsvService } from '../_services/download-csv.service';

@Component({
  selector: 'DPOSW-products',
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {

  @ViewChild('productFileInput') productFileInput!: ElementRef<HTMLInputElement>;

  loadCompleted: boolean = false;
  size: number = 10000;

  code: string;

  Math = Math

  productNameVarSearch: string = null;
  productReferenceVarSearch: string = null;
  productBarcodeVarSearch: string = null;

  commerces: Commerce[];
  commerceId: number = 0;
  commerceSelected: string;

  currentCategoryPage: number = 1;
  categorySelected:Category;
  categories: Category[] = [{id: "0", name: "Todas las categorías"}, {id: "1", name: "Categoria 1"}, {id: "2", name: "Categoria 2"}];

  currentProductsPage: number = 1;
  products: Product[] = [{id: "1", name: "Producto 1", price: 1000, reference: "Referencia 1", barcode: "Codigo de barras 1", stock: 10 },
                        {id: "2", name: "Producto 2", price: 2000, reference: "Referencia 2", barcode: "Codigo de barras 2", stock: 20 },
                        {id: "3", name: "Producto 3", price: 3000, reference: "Referencia 3", barcode: "Codigo de barras 3", stock: 30 },
                        {id: "4", name: "Producto 4", price: 4000, reference: "Referencia 4", barcode: "Codigo de barras 4", stock: 40 },
                        {id: "5", name: "Producto 5", price: 5000, reference: "Referencia 5", barcode: "Codigo de barras 5", stock: 50 },
                        {id: "6", name: "Producto 6", price: 6000, reference: "Referencia 6", barcode: "Codigo de barras 6", stock: 60 },
                        {id: "7", name: "Producto 7", price: 7000, reference: "Referencia 7", barcode: "Codigo de barras 7", stock: 70 },
                        {id: "8", name: "Producto 8", price: 8000, reference: "Referencia 8", barcode: "Codigo de barras 8", stock: 80 }
  ];

  currentLang: string;
  langSubscription: Subscription;

  validationVariable: boolean = false;
  searchCounter: boolean = false;
  varSearch: string = null;

  emptySearch: boolean = false;

  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';

  constructor(private encryptionService: EncryptionService,
      private activatedRoute: ActivatedRoute,
      private portalUsersService: PortalUsersService,
      private downloadCsvService: DownloadCsvService,
      private commercesService: CommercesService,
      private storageService: StorageService,
      private dialog: MatDialog,
      private translate: TranslateService,
      private uiStateService: UIStateService,
      private sessionService: SessionService,
      private authService: AuthService,
      private themeService: ThemeService) {
        
    //Desbloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(true);

    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  ngOnInit(): void {

    this.loadCompleted = false;

    if(this.sessionService.getItem(SessionService.PRODUCT_NAME) != null){
      this.productNameVarSearch = this.sessionService.getItem(SessionService.PRODUCT_NAME);
    }
    if(this.sessionService.getItem(SessionService.PRODUCT_REFERENCE) != null){
      this.productReferenceVarSearch = this.sessionService.getItem(SessionService.PRODUCT_REFERENCE);
    }
    if(this.sessionService.getItem(SessionService.PRODUCT_BARCODE) != null){
      this.productBarcodeVarSearch = this.sessionService.getItem(SessionService.PRODUCT_BARCODE);
    }

    this.storageService.userInfo.subscribe((user) =>{
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken)=> {
          this.authService.setPortalUsersToken(portalUserToken.token);
          this.commercesService.getCommerceList().subscribe({
            next: (commerces) => {
              this.commerces = commerces;
              this.sessionService.getCommerceId().subscribe((commerceId) => {
                if(commerceId != 0) {
                  this.commerceId = commerceId; // Actualizar el valor en el componente
                } else {
                  this.commerceId = commerces[0].commerceId;
                  this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
                }
                this.themeService.loadTheme(this.getCommerceResellerName(commerces));
                this.commerceSelected = this.getCommerceNumber(this.commerceId);
              
                this.categorySelected = this.categories[0];
                this.searchProducts();
              });
            },
            error: (error) => {
              console.error("Error Commerces: ", error);
            }
          });
        },
        error: (error) => {
          console.error("Error Portal user token", error);
        }
      });
    });

  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  onProductNameChange(): void {
    this.sessionService.setItem(SessionService.PRODUCT_NAME, this.productNameVarSearch);
  }

  onProductReferenceChange(): void {
    this.sessionService.setItem(SessionService.PRODUCT_REFERENCE, this.productReferenceVarSearch);
  }

  onProductBarcodeChange(): void {
    this.sessionService.setItem(SessionService.PRODUCT_BARCODE, this.productBarcodeVarSearch);
  }

  cleanFormFields(): void {
    this.productNameVarSearch="";
    this.productReferenceVarSearch="";
    this.productBarcodeVarSearch="";
    this.sessionService.setItem(SessionService.CUSTOMER_NIF, this.productNameVarSearch);
    this.sessionService.setItem(SessionService.CUSTOMER_NAME, this.productReferenceVarSearch);
    this.sessionService.setItem(SessionService.CUSTOMER_LASTNAME, this.productBarcodeVarSearch);
  }

  getCommerceNumber(commerceId:number): string {
    const commerce = this.commerces.find(commerce => commerce.commerceId == commerceId);
    if(commerce != undefined) {
      return commerce.commerceNumber;
    }
    return "";
  }

  searchProducts() {
    this.validationVariable = false;
    this.loadCompleted = false;
   
    //Comienzo query búsqueda
    this.varSearch = "&qs={'and':[";

    //Commerce id
    if (this.commerceId != 0) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch =
        this.varSearch +"{'field':'CommerceId','op':'=','value':'" +this.commerceId +"'}";
    }
    
    //Nombre Producto
    if (this.productNameVarSearch != null && this.productNameVarSearch !== "") {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'name','op':'=*.*','value':'" + this.productNameVarSearch + "'}";
    }

    //Referencia Producto
    if (this.productReferenceVarSearch != null && this.productReferenceVarSearch !== "") {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'reference','op':'=*.*','value':'" + this.productReferenceVarSearch + "'}";
    }

    //Codigo de barras
    if (this.productBarcodeVarSearch != null && this.productBarcodeVarSearch !== "") {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'barcode','op':'=*.*','value':'" + this.productBarcodeVarSearch + "'}";
    }

    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;
    this.getProducts();
  }

  public onCategoryChange(): void {
  //  this.getModels();
  }

  //Añadir product
  addProduct(){
    this.sendProductDetails(null);
  }

  //Encriptación
  sendProductDetails(id: string) {
    if (!id) {
      this.code = '/product-details'
    } else {
      this.code = this.encryptionService.encryptData(id);
      this.code = '/product-details/' + this.encryptionService.encode(this.code);
    }
  }

  //Eliminar productos
  deleteProduct(productId: string){
    this.products = this.products.filter(product => product.id != productId);
    if(this.products.length == 0) {
      this.emptySearch = true;
    }
  }

  downloadCSV(){
    this.downloadCsvService.downloadProductsFile(this.products, this.translate.instant('dpos.products.page.title'), this.currentLang);
  }

  //Importar clientes
  importProducts(){
    this.productFileInput.nativeElement.click();
  }

  onProductFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;
      
      const { rows, errors } = this.parseCSV(text);

      if (errors.length <= 0) {
        let products: Product[] = [];
        for(let i= 0; i < rows.length; i++){
          let product: Product = new Product();
          product.id = i.toString();
          product.reference = rows[i][0];
          product.barcode = rows[i][1];
          product.name = rows[i][2];
          product.price = Number(rows[i][3]);
          product.stock = Number(rows[i][4]);
          
          products.push(product);
        }

        this.showModal = true;
        this.modalTitle = 'Importación de productos';
        this.modalMessage = 'Productos importados correctamente';

        if(!this.products)
          this.products = [];

        this.products.push(...products);

        if(this.products.length > 0)
          this.emptySearch = false;
      }
    };
    reader.readAsText(file);
  }

  closeModal() {
    this.showModal = false;
  }

  private getCommerceResellerName(commerces: Commerce[]): string {
    const commerce = commerces.find(commerce => commerce.commerceId == this.commerceId);
    if(commerce != undefined) {
      return commerce.resellerName;
    }
    return null;
  }

  private getProducts() {
    /*
    this.productsService.getProducts(this.size, this.varSearch).subscribe(
      (products) => {
        this.products = products.data;
        if(this.products.length != 0) {
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      (error) => {
        this.products = null;
        if (error.status == 401 || error.status == 404 ||  error.status == 500) {
          this.emptySearch = true;
          this.loadCompleted = true;
        };
      }
    );
    */
  }

  private parseCSV(csv: string): { rows: string[][], errors: string[] } {
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

    if (currentValue !== '' || currentRow.length > 0) {
      currentRow.push(currentValue);
      rows.push(currentRow);
    }

    // Validación de filas incompletas
    const expectedLength = rows[0]?.length ?? 0;

    rows.forEach((row, index) => {
      if (row.length !== expectedLength) {
        errors.push(
          `Error en la fila ${index + 1}: se esperaban ${expectedLength} columnas pero hay ${row.length}.`
        );
      }
    });

    return { rows, errors };
  }

}
