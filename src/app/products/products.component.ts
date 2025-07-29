import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BalancesService } from '../_services/balances.service';
import { DownloadPDFService } from '../_services/download-pdf.service';
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
import { ProductsService } from '../_services/products.service';
import { Category } from '../_models/category.model';

@Component({
  selector: 'DPOSW-products',
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {

  loadCompleted: boolean = false;
  size: number = 10000;

  productNameVarSearch: string = null;
  productReferenceVarSearch: string = null;
  productBarcodeVarSearch: string = null;

  commerces: Commerce[];
  commerceId: number = 0;
  commerceSelected: string;

  currentCategoryPage: number = 1;
  categorySelected:Category;
  categories: Category[] = [{id: "1", name: "Categoria 1"}, {id: "2", name: "Categoria 2"}];

  currentProductsPage: number = 1;
  products: Product[] = [{id: "1", name: "Producto 1", price: 10, reference: "Referencia 1", barcode: "Codigo de barras 1", stock: 10 },
                        {id: "2", name: "Producto 2", price: 20, reference: "Referencia 2", barcode: "Codigo de barras 2", stock: 20 },
                        {id: "3", name: "Producto 3", price: 30, reference: "Referencia 3", barcode: "Codigo de barras 3", stock: 30 }
  ];

  currentLang: string;
  langSubscription: Subscription;

  validationVariable: boolean = false;
  searchCounter: boolean = false;
  varSearch: string = null;

  emptySearch: boolean = false;

  constructor(private encryptionService: EncryptionService,
      private activatedRoute: ActivatedRoute,
      private balancesService: BalancesService,
      private downloadPDFService: DownloadPDFService,
      private portalUsersService: PortalUsersService,
      private commercesService: CommercesService,
      private storageService: StorageService,
      private productsService: ProductsService,
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


  public openCategoriesModal(): void {
  //  const dialogRef = this.dialog.open(ManufacturersModalComponent);
  //  dialogRef.afterClosed().subscribe(result => {

  //  });
  }

  public onCategoryChange(): void {
  //  this.getModels();
  }

  public openProductsModal(): void {
  //  const dialogRef = this.dialog.open(ManufacturersModelModalComponent);
  //  dialogRef.afterClosed().subscribe(result => {

  //  });
  }

  downloadCSV(){
  //  this.downloadCsvService.downloadCustomersFile(this.customers, 'Customers', this.currentLang);
  }

  //Importar clientes
  importCustomers(){
  //  this.customerFileInput.nativeElement.click();
  }

  onCustomerFileSelected(event: Event) {
  
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

}
