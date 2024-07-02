import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { BaseComponent } from '../common/base/base.component';
import { Data, Router, Routes } from '@angular/router';
import { ClientServiceService } from './client.service.service';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'QSC-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})

export class ClientsComponent extends BaseComponent implements OnInit{

  clients: any = {};
  selectedItems: string[];
  nPage: number = 1;
  nRecords: number;
  loadCompleted: boolean = false;
  element = true;

  empty = '*';
  contains = '=*.*';
  startsWith = '=.*';
  endsWith = '=*.';
  greaterThan = '>';
  lessThan = '<';

  selectAll: boolean = false;
  selectedCheckboxes: any[] = [];
  SelectAll:string = "Seleccionar Todo";
  downloadDisabled:boolean = true;
  selectTen: boolean  = false;
  selectedRecords:number = 0;

  clientsFormGroup = new FormGroup({
    nif: new FormControl(''),
    name: new FormControl(''),
    surname: new FormControl(''),
    phoneNumber: new FormControl(''),
    email: new FormControl(''),

    nifSelect: new FormControl(this.contains),
    nameSelect: new FormControl(this.contains),
    surnameSelect: new FormControl(this.contains),
    phoneNumberSelect: new FormControl(this.contains),
    emailSelect: new FormControl(this.contains),

    greater: new FormControl(this.greaterThan),
    lesser: new FormControl(this.lessThan),
    greaterDate: new FormControl(''),
    lesserDate: new FormControl(''),
    maxRecords: new FormControl('100'),
  });

  nif = this.clientsFormGroup.get('nif').value;
  name= this.clientsFormGroup.get('name').value;
  surname = this.clientsFormGroup.get('surname').value;
  phoneNumber = this.clientsFormGroup.get('phoneNumber').value;


  url: any ='https://quickshopv4.diusframi.tech:39443/api/customers?from=0&size=100&qs={"and":[{"field":"Deleted","op":"=","value":"false"}]}';

  constructor(public override router: Router, private qsacess: ClientServiceService) {
    super(router);
  }
  override ngOnInit(): void {
    this.qsacess.loadData(this.url).subscribe((clientsData) => {
      this.clients = clientsData;
      this.nRecords = this.clients.Data.length;
      this.loadCompleted = true;
      this.selectedItems = new Array<string>();
      console.log(this.clients)

    });
  }

  search() {
    //Funcion para Busqueda/ Busqueda Avanzada
   if(this.clientsFormGroup.get('phoneNumber').value === "" && this.clientsFormGroup.get('email').value){
    this.url ='https://quickshopv4.diusframi.tech:39443/api/customers?from=0&size=10&qs={"and":[{"field":"Deleted","op":"=","value":"false"},{"field":"NIF","op":"=*.*","value":"'+this.clientsFormGroup.get('nif').value+'"},{"field":"Name","op":"=*.*","value":"'+this.clientsFormGroup.get('name').value+'"},{"field":"Lastname","op":"=*.*","value":"'+this.clientsFormGroup.get('surname').value+'"},{"field":"Deleted","op":"=","value":"false"},{"field":"Phone","op":"=*.*","value":"'+this.clientsFormGroup.get('phoneNumber').value+'"},{"field":"Email","op":"=*.*","value":"'+this.clientsFormGroup.get('email').value+'"}]}';
   }else{
    this.url ='https://quickshopv4.diusframi.tech:39443/api/customers?from=0&size=10&qs={"and":[{"field":"Deleted","op":"=","value":"false"},{"field":"NIF","op":"=*.*","value":"'+this.clientsFormGroup.get('nif').value+'"},{"field":"Name","op":"=*.*","value":"'+this.clientsFormGroup.get('name').value+'"},{"field":"Lastname","op":"=*.*","value":"'+this.clientsFormGroup.get('surname').value+'"}]}';
   }
    this.qsacess.loadData(this.url).subscribe((clientsData) => {
      this.clients = clientsData;
      this.nRecords = this.clients.Data.length;
      this.loadCompleted = true;
      this.selectedItems = new Array<string>();
      console.log(this.clientsFormGroup.get('nif').value)
    });
  }

  showAdvancedSearch() {
    return (this.element = true);
  }

  hideAdvancedSearch() {
    return (this.element = false);
  }

  clearSearch() {
    window.location.reload();

  }
  
  selectAllRecords() {
    if (this.selectAll) {
      // Deseleccionar todos los registros
      this.selectedCheckboxes = [];
      this.selectAll = false;
      this.SelectAll = 'Seleccionar todo';
      this.downloadDisabled = true;
    } else {
      // Seleccionar todos los registros
      this.selectedCheckboxes = this.clients.Data.slice();
      this.selectAll = true;
      this.SelectAll = 'Anular Selección';
      this.selectTen = false; // Desactivar la selección de la página actual
      this.downloadDisabled = false;
    }
    this.selectedRecords = this.selectedCheckboxes.length;
  }

  selectTenRecords() {
    if (this.selectTen) {
      // Deseleccionar los registros de la página actual
      let currentPageCheckboxes = this.clients.Data.slice((this.nPage - 1) * 10, this.nPage * 10);
      this.selectedCheckboxes = this.selectedCheckboxes.filter(item => !currentPageCheckboxes.includes(item));
      this.selectTen = false;
      this.SelectAll = 'Seleccionar todos';
      this.downloadDisabled = true;
    } else {
      if (this.selectAll) {
        // Deseleccionar todos los registros
        this.selectedCheckboxes = [];
        this.selectAll = false;
      }
  
      // Seleccionar los registros de la página actual
      let currentPageCheckboxes = this.clients.Data.slice((this.nPage - 1) * 10, this.nPage * 10);
      this.selectedCheckboxes = [...new Set([...this.selectedCheckboxes, ...currentPageCheckboxes])];
      this.selectTen = true;
      this.SelectAll = 'Seleccionar todos';
      this.downloadDisabled = false;
    }
    this.selectedRecords = this.selectedCheckboxes.length;
  }
  isSelected(item: any): boolean {
    return this.selectedCheckboxes.includes(item);
  }

  checkedCheckbox(item: any) {
    const index = this.selectedCheckboxes.indexOf(item);
  
    if (index !== -1) {
      this.selectedCheckboxes.splice(index, 1);
    } else {
      this.selectedCheckboxes.push(item);
    }
  
    this.selectedRecords = this.selectedCheckboxes.length;
    this.downloadDisabled = this.selectedCheckboxes.length === 0;
  }
}

