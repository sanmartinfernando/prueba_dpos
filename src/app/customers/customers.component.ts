import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from '../_services/encryption.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { Component, OnInit } from '@angular/core';
import { PortalUsersService } from '../_services/portal-users.service';
import { CommercesService } from '../_services/commerces.service';
import { AuthService } from '../_services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Commerce } from '../_models/commerce.model';
import { SessionService } from '../_services/session.service';
import { VerifactuStatus } from '../_models/order-verifactu.model';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { CustomersService } from '../_services/customers.service';
import { CustomerInfo } from '../_models/customer-info.model';

@Component({
  selector: 'DPOSW-customers',
  templateUrl: './customers.component.html',
})
export class CustomersComponent implements OnInit {

  currentFormats: any;
  size: number = 10000;
  customers: CustomerInfo;
  selectSales = new Array(3);
  salesTicketBai = new Array;
  operationN: number;
  totalSales: number = 0;
  totalSalesString: string;
  page: number = 0;
  code: string;
  loadCompleted: boolean = false;
  isLoggedIn: boolean = true;
  Math = Math;
  validationVariable: boolean = false;
  commerceId: number = 0;
  verifactuStatus = VerifactuStatus;

  //Parámetros de búsqueda
  public terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter: boolean = false;
  sinceDate: string;
  sinceDateMilli: number;
  tilDate: string;
  tilDateMilli: number;
  today: Date = new Date();
  todayMilli = this.today.getTime();
  typeVarSearch: string = null;
  translatedTypeVarSearch = new Array(3);
  selTransTypeVarSearch: number = null;
  customerNifVarSearch: string = null;
  customerNameVarSearch: string = null;
  customerLastNameVarSearch: string = null;
  customerPhoneVarSearch: string = null;
  customerEmailVarSearch: string = null;
  
  varSearch: string = '';
  emptySearch: boolean = false;
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';

  public opTypes: any;

  // Checkboxes
  selectedIndices: number[] = [];
  isAllSelected: boolean = false;
  counter = 0;

  currentLang: string;
  langSubscription: Subscription;

  commerceSelected: string;
  commerces: Commerce[];

  constructor(
    private encryptionService: EncryptionService,
    private downloadCsvService: DownloadCsvService,
    private storageService: StorageService,
    private portalUsersService: PortalUsersService,
    private customersService: CustomersService,
    private commercesService: CommercesService,
    private translate: TranslateService,
    private sessionService: SessionService,
    private themeService: ThemeService,
    private uiStateService: UIStateService,
    private authService: AuthService
  ) {  

    //Desbloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(true);
    
    this.currentLang = this.translate.currentLang || 'es';
      this.langSubscription = this.translate.onLangChange.subscribe(event => {
        this.currentLang = event.lang;
        this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
      });
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadCompleted = false;

    if(this.sessionService.getItem(SessionService.CUSTOMER_NIF) != null){
      this.customerNifVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_NIF);
    }
    if(this.sessionService.getItem(SessionService.CUSTOMER_NAME) != null){
      this.customerNameVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_NAME);
    }
    if(this.sessionService.getItem(SessionService.CUSTOMER_LASTNAME) != null){
      this.customerLastNameVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_LASTNAME);
    }
    if(this.sessionService.getItem(SessionService.CUSTOMER_PHONE) != null){
      this.customerPhoneVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_PHONE);
    }
    if(this.sessionService.getItem(SessionService.CUSTOMER_EMAIL) != null){
      this.customerEmailVarSearch = this.sessionService.getItem(SessionService.CUSTOMER_EMAIL);
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
                this.searchCustomers();
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

  searchCustomers() {
    this.validationVariable = false;
    this.loadCompleted = false;
   
    //Comienzo query búsqueda
    this.varSearch = "&qs={'and':[";

    //Parámetros de búsqueda activos
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
    
    //NIF
    if (this.customerNifVarSearch != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'NIF','op':'=*.*','value':'" + this.customerNifVarSearch + "'}";
    }

    //Nombre
    if (this.customerNameVarSearch != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'Name','op':'=*.*','value':'" + this.customerNameVarSearch + "'}";
    }

    //Apellidos
    if (this.customerLastNameVarSearch != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'LastName','op':'=*.*','value':'" + this.customerLastNameVarSearch + "'}";
    }

    //Telefono
    if (this.customerPhoneVarSearch != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'Phone','op':'=*.*','value':'" + this.customerPhoneVarSearch + "'}";
    }

    //Email
    if (this.customerEmailVarSearch != null) {
      if (this.searchCounter == false) {
        this.searchCounter = true;
      } else {
        this.varSearch = this.varSearch + ',';
      }
      this.varSearch = this.varSearch + "{'field':'Email','op':'=*.*','value':'" + this.customerEmailVarSearch + "'}";
    }

    this.varSearch = this.varSearch + ']}';
    this.searchCounter = false;
    this.getCustomers();
  }

  getCustomers() {
    this.customersService.getCustomers(this.size, this.varSearch).subscribe(
      (customers) => {
        this.customers = customers;
        if(this.customers.data.length != 0) {
          this.emptySearch = false;
        } else {
          this.emptySearch = true;
        }
        this.loadCompleted = true;
      },
      (error) => {
        if (error.status == 401 || error.status == 500) {
          this.emptySearch == true;
          this.loadCompleted = true;
        };
      }
    );
  }

  //Checkboxes
  checkAll(event: any) {
    if (event.target.checked) {
      this.selectedIndices = [];
      for (let i = 0; i < this.customers.data.length; i++) {
        let globalIndex = i;
        this.selectedIndices.push(globalIndex);
      }
      this.counter = this.selectedIndices.length;
      this.isAllSelected = true;
    } else {
      this.selectedIndices = [];
      this.counter = 0;
      this.isAllSelected = false;
    }
  }

  //Encriptación
  sendCustomerDetails(id: string) {
    this.code = this.encryptionService.encryptData(id);
    this.code = '/details/' + this.encryptionService.encode(this.code);
  }

    //Boton Descargar
  uncheckCustomers(){
    //this.downloadCsvService.downloadSalesFile(this.sales, 'Sales', this.currentLang);
  }
    //Boton Descargar
  addCustomer(){
    //this.downloadCsvService.downloadSalesFile(this.sales, 'Sales', this.currentLang);
  }
    //Boton Descargar
  importCustomers(){
    //this.downloadCsvService.downloadSalesFile(this.sales, 'Sales', this.currentLang);
  }

  //Boton Descargar
  downloadCSV(){
    //this.downloadCsvService.downloadSalesFile(this.sales, 'Sales', this.currentLang);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onCommerceChange(): void {
    this.commerceId = this.getCommerceId();
    this.searchCustomers();
  }
  
  onCustomerNifChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_NIF, this.customerNifVarSearch);
  }

  onCustomerNameChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_NAME, this.customerNameVarSearch);
  }

  onCustomerLastNameChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_LASTNAME, this.customerLastNameVarSearch);
  }

  onCustomerPhoneChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_PHONE, this.customerPhoneVarSearch);
  }

  onCustomerEmailChange(): void {
    this.sessionService.setItem(SessionService.CUSTOMER_EMAIL, this.customerEmailVarSearch);
  }

  getCommerceId(): number {
    const commerce = this.commerces.find(commerce => commerce.commerceNumber == this.commerceSelected);
    if(commerce != undefined) {
      return commerce.commerceId;
    }
    return 0;
  }

  getCommerceNumber(commerceId:number): string {
    const commerce = this.commerces.find(commerce => commerce.commerceId == commerceId);
    if(commerce != undefined) {
      return commerce.commerceNumber;
    }
    return "";
  }

  private getCommerceResellerName(commerces: Commerce[]): string {
    const commerce = commerces.find(commerce => commerce.commerceId == this.commerceId);
    if(commerce != undefined) {
      return commerce.resellerName;
    }
    return null;
  }
}
