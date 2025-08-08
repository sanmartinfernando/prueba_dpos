import { Component, inject, OnInit } from '@angular/core';
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
import { Category } from 'src/app/_models/category.model';
import { Modifiers } from '../../_models/modifiers.model';


@Component({
  selector: 'app-dpos-product-details',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {

  private encryptionService = inject(EncryptionService);
  private portalUsersService = inject(PortalUsersService);
  private activatedRoute = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private sessionService = inject(SessionService);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);

  loadCompleted = false;
  idProduct: string = null;
  titlePage: string;
  code: string;
  product: Product;
  categoryIdSelected: string[] = [];
  modifiersIdSelected: string;
  salesStartDate: string;
  salesStartDateMilli: number;
  salesEndDate: string;
  salesEndDateMilli: number;

  categories: Category[] = [{ id: "0", name: "Todas las categorías" }, { id: "1", name: "Categoria 1" }, { id: "2", name: "Categoria 2" }];
  modifiers: Modifiers[] = [{ id: "0", name: "Punto de la carne", modifiers: "muy hecho, hecho, al punto, crudo" }];

  constructor(private uiStateService: UIStateService,
    private themeService: ThemeService) {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));

    //Bloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(false);
  }

  ngOnInit(): void {

    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
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
    this.salesStartDate = (document.getElementById('salesDateFrom') as HTMLInputElement).value;
    if (this.salesStartDate.length > 0) {
      this.salesStartDateMilli = Date.parse(this.salesStartDate);
    }
  }

  onTilSalesEndDateChange(): void {
    this.salesEndDate = (document.getElementById('salesDateTo') as HTMLInputElement).value;
    if (this.salesEndDate.length > 0) {
      this.salesEndDateMilli = Date.parse(this.salesEndDate);
    }
  }

  public getProduct(idClient: string): void {
    //TODO
  }

  public openCategoriesModal(id?: string): void {
    const dialogRef = this.dialog.open(CategoryModalComponent, { data: { id } });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  public openModifiersModal(id?: string): void {
    const dialogRef = this.dialog.open(ModifiersModalComponent, { data: { id } });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  public saveProduct(): void {
    if (this.product) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  private updateProduct() {
    this.code = '/products';
  }

  private createProduct() {
    this.code = '/products';
  }
}
