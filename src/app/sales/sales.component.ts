import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../common/base/base.component';
import { Router } from '@angular/router';
import { SalesService } from './sales.service';
import { FormControl, FormGroup } from '@angular/forms';
import { query } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { LanguageManagerService } from '../_services/languagemanager.service';


@Component({
  selector: 'QSC-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent extends BaseComponent implements OnInit{

/* --------Propiedades-------- */

  // Mostrar busqueda avanzada
  standarSearch :boolean = true;
  advancedSearch:boolean = false;

  // Listado de ventas, url, número de registros
  sales:any = [];
  languages = [];
  url: string = 'https://quickshopv4.diusframi.tech:39443/api/orders?from=0&size=200&qs=';
  nRecords:number;
  translationDict: any;

  // Paginación
  nPage:number=1;

  // Selección checkboxes
  loadCompleted: boolean = false;
  downloadDisabled:boolean = true;
  selectedRecords:number = 0;
  selectAll: boolean = false;
  selectTen: boolean  = false;
  selectedCheckboxes: any[] = [];
  linkSelectAll:string = "@@BASE_SelectAll";

  // Formulario de búsqueda
  referenceSelect:any;
  reference:any;
  terminal:any;
  nRecordsForm:any;
  since:any;
  until:any;
  type:any;
  qs:any;

  formSearch = new FormGroup({
    'referenceSelect': new FormControl(''),
    'reference': new FormControl(''),
    'terminal': new FormControl(''),
    'nRecordsForm': new FormControl('200'),
    'since': new FormControl (''),
    'until': new FormControl(''),
    'type': new FormControl('')
  });

  //login
  logged:boolean;
  modal:string = "none";
  translationLoaded:boolean = false;

  /* --------Constructor  ngOnInit--------- */

  constructor(public override router: Router, private salesService: SalesService, private datePipe: DatePipe,
    private authService:AuthService,private storageService:StorageService,private languageManager:LanguageManagerService) {
    super(router);
  }

  override ngOnInit(): void {
    // Si estas logueado devolvera true
    this.logged = this.storageService.isLoggedIn();

    // Cuando se carga la traduccion el valor cambia a true
    this.languageManager.configObservable.subscribe(() => {
      this.translationLoaded = true;
    });

    // Si esta logueado se carga la pagina con los registros
    if (this.logged==true) {
      
      this.salesService.showSales(this.url).subscribe(registrosVentas=>{
        this.sales=registrosVentas;
        this.nRecords = this.sales.Data.length;
        this.translationLoaded = true;
        // Ordenar registros por fecha más reciente
        this.sales.Data.sort((a, b) => {
        const dateA = new Date(a.FinishedAt);
        const dateB = new Date(b.FinishedAt);
        return dateB.getTime() - dateA.getTime();
        });
        this.loadCompleted=true;
      });
  
    } else {

      // this.loadCompleted = true;
      // this.modal = "block";
      this.router.navigate(['/login']);
    }

  }

/* --------Funciones--------- */

  // Filtro de búsqueda
  formData(){
    this.referenceSelect = this.formSearch.get("referenceSelect")?.value;
    this.reference = this.formSearch.get("reference")?.value;
    this.terminal = this.formSearch.get("terminal")?.value;
    this.nRecordsForm = this.formSearch.get("nRecordsForm")?.value;
    this.since = this.formSearch.get("since")?.value;
    this.until = this.formSearch.get("until")?.value;
    this.type = this.formSearch.get("type")?.value;
  
    let qs = [];
  
    // Agregar campos no vacíos al objeto qs
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
  
    if (this.terminal) {
      qs.push({ field: 'terminalnumber', op: '=', value: this.terminal });
    }
  
    if (this.since) {
      let sinceDate = new Date(this.since);
      let sinceUnixTimestamp = sinceDate.getTime();
      qs.push({ field: 'FinishedAt', op: '>', value: sinceUnixTimestamp.toString() });
    }
  
    if (this.until) {
      let untilDate = new Date(this.until);
      let untilUnixTimestamp = untilDate.getTime();
      qs.push({ field: 'FinishedAt', op: '<', value: untilUnixTimestamp.toString() });
    }
  
    if (this.type) {
      qs.push({ field: 'Type', op: '=', value: this.type });
    }
  
    //Convertir objeto qs en una petición remplazando los caracteres especiales con JSON.stringify()
    let qsString = JSON.stringify({ and: qs })
    .replace(/"/g, '\'')
    .replace(/\//g, '\\\\/')
    .replace(/:/g, ': ')
    .replace(/,/g, ', ');
  
    let baseUrl = 'https://quickshopv4.diusframi.tech:39443/api/orders';
    this.url = `${baseUrl}?from=0&size=${this.nRecordsForm}&qs=${qsString}`;
  
    this.salesService.showSales(this.url).subscribe(registrosVentas=>{
      this.sales=registrosVentas;
      this.nRecords = this.sales.Data.length;
    });
  
  }

  // Seleccionar todos los checkboxes
  toggleSelectAll() {
    if (this.selectAll) {
      // Deseleccionar todos los registros
      this.selectedCheckboxes = [];
      this.selectAll = false;
      this.linkSelectAll = '@@BASE_SelectAll';
      this.downloadDisabled = true;
    } else {
      // Seleccionar todos los registros
      this.selectedCheckboxes = this.sales.Data.slice();
      this.selectAll = true;
      this.linkSelectAll = '@@BASE_SelectNone';
      this.selectTen = false; // Desactivar la selección de la página actual
      this.downloadDisabled = false;
    }
  
    this.selectedRecords = this.selectedCheckboxes.length;
  }

  // Seleccionar checkboxes de la página actual
  toggleSelectTen() {
    if (this.selectTen) {
      // Deseleccionar los registros de la página actual
      let currentPageCheckboxes = this.sales.Data.slice((this.nPage - 1) * 10, this.nPage * 10);
      this.selectedCheckboxes = this.selectedCheckboxes.filter(item => !currentPageCheckboxes.includes(item));
      this.selectTen = false;
      this.linkSelectAll = '@@BASE_SelectAll';
      this.downloadDisabled = true;
    } else {
      if (this.selectAll) {
        // Deseleccionar todos los registros
        this.selectedCheckboxes = [];
        this.selectAll = false;
      }
  
      // Seleccionar los registros de la página actual
      let currentPageCheckboxes = this.sales.Data.slice((this.nPage - 1) * 10, this.nPage * 10);
      this.selectedCheckboxes = [...new Set([...this.selectedCheckboxes, ...currentPageCheckboxes])];
  
      this.selectTen = true;
      this.linkSelectAll = '@@BASE_SelectAll';
      this.downloadDisabled = false;
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
  }

  // Mostrar busqueda avanzada
  showAdvanced(){
    this.advancedSearch = !this.advancedSearch;
    this.standarSearch = !this.standarSearch;
  }

  // Limpiar busqueda
  clean(){
    window.location.reload();
  }

  //Cerrar modal
  closeModal(){
    this.modal = "none";
    this.router.navigate(['/login']);
  }

}