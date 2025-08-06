import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/_services/auth.service';
import { EncryptionService } from 'src/app/_services/encryption.service';
import { PortalUsersService } from 'src/app/_services/portal-users.service';
import { SessionService } from 'src/app/_services/session.service';
import { StorageService } from 'src/app/_services/storage.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';
import { Product } from '../../_models/product.model';
import { CategoryModalComponent } from 'src/app/categories/category-modal.component';
import { ModifiersModalComponent } from 'src/app/modifiers/modifiers-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'DPOSW-product-details',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {

  loadCompleted: boolean = false;
  idProduct: string = null;
  titlePage: string;
  code: string;

  product: Product;

  salesStartDate: string;
  salesStartDateMilli: number;
  salesEndDate: string;
  salesEndDateMilli: number;

  constructor(private encryptionService: EncryptionService,
      private portalUsersService: PortalUsersService,
      private activatedRoute: ActivatedRoute,
      private storageService: StorageService,
      private uiStateService: UIStateService,
      private sessionService: SessionService,
      private dialog: MatDialog,
      private themeService: ThemeService,
      private translate: TranslateService,
      private authService: AuthService) {
        
      this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
  
      //Bloqueamos el selector de comercio;
      this.uiStateService.setFormSelectEnabled(false);
    }
    
    ngOnInit(): void {

      this.storageService.userInfo.subscribe((user) =>{
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken)=> {
          this.authService.setPortalUsersToken(portalUserToken.token);
          
          const idParam = this.activatedRoute.snapshot.params['id'];
          if (idParam) {
            this.idProduct = this.encryptionService.decode(idParam);
            this.titlePage = this.translate.instant('dpos.product-details.page.edit.title');
            this.getProduct(this.idProduct);
          } else {
            this.titlePage = this.translate.instant('dpos.product-details.page.add.title');
          }

          this.loadCompleted = true;

        },
        error: (error) => {
          console.error("Error Portal user token", error);
        }
      });
    });
  }

  onTilSalesStartDateChange(): void {
    this.salesStartDate = (<HTMLInputElement>(document.getElementById('salesDateFrom'))).value;
    if(this.salesStartDate.length > 0){
      this.salesStartDateMilli = Date.parse(this.salesStartDate);
    } 
  }

  onTilSalesEndDateChange(): void {
    this.salesEndDate = (<HTMLInputElement>(document.getElementById('salesDateTo'))).value;
    if(this.salesEndDate.length > 0){
      this.salesEndDateMilli = Date.parse(this.salesEndDate);
    } 
  }

  public getProduct(idClient: string): void {
    //TODO
  }

  public openCategoriesModal(id?: string): void {
    const dialogRef = this.dialog.open(CategoryModalComponent, {data: { id }});
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  public openModifiersModal(id?: string): void {
    const dialogRef = this.dialog.open(ModifiersModalComponent, {data: { id }});
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  public saveProduct(): void {
      if(this.product) {
        this.updateProduct();
      } else {
        this.createProduct();
      }
    }
  
    private updateProduct() {
      //TODO
      this.code = '/products';
    }
  
    private createProduct() {
      //TODO
      this.code = '/products';
    }
}
