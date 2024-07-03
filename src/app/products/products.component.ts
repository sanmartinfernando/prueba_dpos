import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../common/base/base.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ProductsService } from './products.service';
import { HttpClient } from '@angular/common/http';
import { LanguageManagerService } from '../_services/languagemanager.service';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'QSC-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent extends BaseComponent implements OnInit{

/* --------Propiedades-------- */

  // Mostrar y ocultar busqueda avanzada
  standarSearch:boolean = true;
  advancedSearch:boolean = false;

  // Lista de productos, lista de categorias
  products:any = [];
  categoriesList:any = [];
  url: string = 'https://dpos.diusframi.tech:39443/wstickets/api/Balances?size=25&offset=0';
  urlCategories:string = "https://quickshopv4.diusframi.tech:39443/api/categories?from=0&size=300&qs=";
  
  // Paginación, numero de registros de la tabla
  nPage:number=1;
  nRecords:number;
  loadCompleted: boolean = false;
  
  // Seleccionar checkboxes
  downloadDisabled:boolean = true;
  deleteDisabled:boolean = true;
  selectedRecords:number = 0;
  selectAll: boolean = false;
  selectTen: boolean  = false;
  selectedCheckboxes: any[] = [];
  linkSelectAll:string = "Seleccionar Todos";

  // Modal
  modal = "none";
  modalComfirm = "none";
  modalMessage:string;

  // Eliminar registro
  deleteId:number;
  deletedProduct:boolean = false;

  // Formulario búsqueda
  nameSelect:any;
  name:any;
  nRecordsForm:any;
  categoriesSelect:any;
  categories:any;
  referenceSelect:any;
  reference:any;
  codeSelect:any;
  code:any;
  qs:any;

  formSearch = new FormGroup({
    'nameSelect': new FormControl('contiene'),
    'name': new FormControl(''),
    'categoriesSelect': new FormControl('contiene'),
    'categories': new FormControl(''),
    'referenceSelect': new FormControl('contiene'),
    'reference': new FormControl(''),
    'codeSelect': new FormControl('contiene'),
    'code': new FormControl(''),
    'nRecordsForm': new FormControl('200')
  });

  //login
  logged:boolean;
  translationLoaded:boolean = false;

  /* --------Constructor  ngOnInit-------- */

  constructor(public override router: Router, private productsService:ProductsService, private datePipe: DatePipe, private http:HttpClient,
    private translate:LanguageManagerService, private storageService:StorageService) {
    super(router);
  }
  
  override ngOnInit(): void {

    // Si estas logueado devolvera true
    this.logged = true;// RDP TRUCO ESTO PARA VER EL CORS DE TICKETS this.storageService.isLoggedIn();
    if (this.logged==true) {
      this.productsService.showProducts(this.url).subscribe(listProducts=>{
        this.products=listProducts;
        this.nRecords = this.products.Data.length;
        
        // Ordenar registros por orden alfabético
        this.products.Data.sort((a, b) => {
          const nameA = a.Name.toLowerCase();
          const nameB = b.Name.toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        this.loadCompleted=true;
      });
      
      this.productsService.showProducts(this.urlCategories).subscribe(listCategories=>{
        this.categoriesList=listCategories;
        this.categoriesList.Data.sort((a, b) => a.Name.localeCompare(b.Name));
      });

  } else {
    this.router.navigate(['/login']);
  }

  }

/* --------Funciones--------- */

  // Filtro de búsqueda 
  formData(){
    this.nameSelect = this.formSearch.get("nameSelect")?.value;
    this.name = this.formSearch.get("name")?.value;
    this.nRecordsForm = this.formSearch.get("nRecordsForm")?.value;
    this.categories = this.formSearch.get("categories")?.value;
    this.categoriesSelect = this.formSearch.get("categoriesSelect")?.value;
    this.referenceSelect = this.formSearch.get("referenceSelect")?.value;
    this.reference = this.formSearch.get("reference")?.value;
    this.codeSelect = this.formSearch.get("codeSelect")?.value;
    this.code = this.formSearch.get("code")?.value;

    let qs = [];

    // Agregar campos no vacíos al objeto qs
    if (this.deletedProduct == false) {
      let op = '=';
      qs.push({ field: 'Deleted', op: op, value: this.deletedProduct });
    }

    if (this.name) {
      let op = '=*.*';
      if (this.nameSelect === 'contiene') {
        op = '=*.*';
      } else if (this.nameSelect === 'empieza por') {
        op = '=.*';
      } else if (this.nameSelect === 'termina por') {
        op = '=*.';
      }
      qs.push({ field: 'Name', op: op, value: this.name });
    }

    if (this.categories) {
      let op = '=*.*';
      if (this.categoriesSelect === 'contiene') {
        op = '=*.*';
      } else if (this.categoriesSelect === 'empieza por') {
        op = '=.*';
      } else if (this.categoriesSelect === 'termina por') {
        op = '=*.';
      }
      qs.push({ field: 'Category', op: op, value: this.categories });
    }

    if (this.reference) {
      let op = '=*.*';
      if (this.referenceSelect === 'contiene') {
        op = '=*.*';
      } else if (this.referenceSelect === 'empieza por') {
        op = '=.*';
      } else if (this.referenceSelect === 'termina por') {
        op = '=*.';
      }
      qs.push({ field: 'Reference', op: op, value: this.reference });
    }

    if (this.code) {
      let op = '=*.*';
      if (this.codeSelect === 'contiene') {
        op = '=*.*';
      } else if (this.codeSelect === 'empieza por') {
        op = '=.*';
      } else if (this.codeSelect === 'termina por') {
        op = '=*.';
      }
      qs.push({ field: 'BarCode', op: op, value: this.code });
    }
    

  //Convertir objeto qs en una petición remplazando los caracteres especiales con JSON.stringify()
    let qsString = JSON.stringify({ and: qs })
    .replace(/"/g, '\'')
    .replace(/\//g, '\\\\/')
    .replace(/:/g, ': ')
    .replace(/,/g, ', ');
  
    let baseUrl = 'https://quickshopv4.diusframi.tech:39443/api/products';
    this.url = `${baseUrl}?from=0&size=${this.nRecordsForm}&qs=${qsString}`;

    this.productsService.showProducts(this.url).subscribe(listProducts=>{
      this.products=listProducts;
      this.nRecords = this.products.Data.length;
      this.loadCompleted=true;
      console.log(this.products);
    });
  
  }

  // Seleccionar checkboxes página actual
  toggleSelectTen() {
    if (this.selectTen) {
      // Deseleccionar los registros de la página actual
      let currentPageCheckboxes = this.products.Data.slice((this.nPage - 1) * 10, this.nPage * 10);
      this.selectedCheckboxes = this.selectedCheckboxes.filter(item => !currentPageCheckboxes.includes(item));
      this.selectTen = false;
      this.linkSelectAll = 'Seleccionar todos';
      this.downloadDisabled = true;
      this.deleteDisabled = true;

    } else {

      if (this.selectAll) {
        // Deseleccionar todos los registros
        this.selectedCheckboxes = [];
        this.selectAll = false;
      }
  
      // Seleccionar los registros de la página actual
      let currentPageCheckboxes = this.products.Data.slice((this.nPage - 1) * 10, this.nPage * 10);
      this.selectedCheckboxes = [...new Set([...this.selectedCheckboxes, ...currentPageCheckboxes])];
      this.selectTen = true;
      this.linkSelectAll = 'Seleccionar todos';
      this.downloadDisabled = false;
      this.deleteDisabled = false;
    }
  
    this.selectedRecords = this.selectedCheckboxes.length;
  }

  // Seleccionar checkbox
  isSelected(item: any): boolean {
    return this.selectedCheckboxes.includes(item);
  }

  toggleCheckbox(item: any) {
    const index = this.selectedCheckboxes.indexOf(item);
  
    if (index !== -1) {
      this.selectedCheckboxes.splice(index, 1);
    } else {
      this.selectedCheckboxes.push(item);
    }
  
    this.selectedRecords = this.selectedCheckboxes.length;
    this.downloadDisabled = this.selectedCheckboxes.length === 0;
    this.deleteDisabled = this.selectedCheckboxes.length === 0;
  }

  // Seleccionar todos los checkboxes
  toggleSelectAll() {
    if (this.selectAll) {
      // Deseleccionar todos los registros
      this.selectedCheckboxes = [];
      this.selectAll = false;
      this.linkSelectAll = 'Seleccionar todos';
      this.downloadDisabled = true;
      this.deleteDisabled = true;
    } else {
      // Seleccionar todos los registros
      this.selectedCheckboxes = this.products.Data.slice();
      this.selectAll = true;
      this.linkSelectAll = 'Anular Selección';
      this.selectTen = false; // Agrega esta línea para desactivar la selección de la página actual
      this.downloadDisabled = false;
      this.deleteDisabled = false;
    }
    this.selectedRecords = this.selectedCheckboxes.length;
  }

  // Mostrar busqueda avanzada
  showAdvanced(){
    this.advancedSearch = !this.advancedSearch;
    this.standarSearch = !this.standarSearch;
  }

  // Limpiar formulario
  clean(){
    window.location.reload();
  }

  // Eliminar un registro
  deleteOne(id:any){
    this.deleteId = id;
    this.openModalComfirm();
  }

  // Eliminar registros seleccionados
  deleteSelected(){
    this.openModalComfirm();
  }

  deleteSelectedProducts(){
    // Itera sobre los elementos seleccionados en selectedCheckboxes
    for (let item of this.selectedCheckboxes) {
      this.deleteId = item.ProductId;
      this.deleteProduct();
    }
  }

  deleteMultiple(){
    
    if(this.selectedCheckboxes.length > 0){
      this.deleteSelectedProducts()

    } else if(this.selectedCheckboxes.length == 0){
      this.deleteProduct();
    }
  }

  deleteProduct(){
    let urlDelete = "https://quickshopv4.diusframi.tech:39443/api/products/"+ this.deleteId;
    this.http.delete(urlDelete).subscribe(
      response=>{
        console.log("Producto eliminado correctamente"+ response);
        this.modalMessage = "se ha eliminado correctamente";
        this.onCloseHandledComfirm()
        this.openModal();
      },
      error=>{
        console.log("error" + error);
        this.modalMessage = "no se ha podido eliminar, inténtelo de nuevo";
        this.onCloseHandledComfirm()
        this.openModal();
      }
    );
  }

  // Modal de comfirmación
  openModalComfirm = () => {
    this.modalComfirm = "block";
  }

  onCloseHandledComfirm() {
    this.modalComfirm = "none";
    this.router.navigate(['/products']);
  }

  // Modal de información
  openModal = () => {
    this.modal = "block";
  }

  onCloseHandled() {
    this.modal = "none";
    window.location.reload();
  }

}

