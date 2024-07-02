import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../common/base/base.component';
import { Data, Router, Routes } from '@angular/router';
import { BalancesDetailsComponent } from './balances-details/balances-details.component';
import { DataServices } from './data.services';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'QSC-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.css'],
})
export class BalancesComponent extends BaseComponent implements OnInit {
  // ---------------- Propiedades------------------

  balances: any = {};
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
  SelectAll: string = 'Seleccionar Todo';
  downloadDisabled: boolean = true;
  selectTen: boolean = false;
  selectedRecords: number = 0;

  //Propiedades de el buscador y sus valores
  balancesFormGroup = new FormGroup({
    reference: new FormControl(''),
    TerminalNumber: new FormControl(this.empty),
    referenceSelect: new FormControl(this.contains),
    greater: new FormControl(this.greaterThan),
    lesser: new FormControl(this.lessThan),
    greaterDate: new FormControl(''),
    lesserDate: new FormControl(''),
    maxRecords: new FormControl('100'),
  });

  referenceSelect = this.balancesFormGroup.get('referenceSelect').value;
  greaterThanSign = this.balancesFormGroup.get('greater')?.value;
  lesserThanSign = this.balancesFormGroup.get('lesser')?.value;
  maxRecords = this.balancesFormGroup.get('maxRecords')?.value;

  url: any = 'https://quickshopv4.diusframi.tech:39443/api/balances?&from=0&size=1000&qs';

  constructor(public override router: Router, private qsacess: DataServices) {
    super(router);
  }
  override ngOnInit(): void {
    this.qsacess.loadData(this.url).subscribe((balancesData) => {
      this.balances = balancesData;
      this.nRecords = this.balances.Data.length;
      this.loadCompleted = true;
      this.selectedItems = new Array<string>();
    });
  }

  search() {
    //Funcion para Busqueda/ Busqueda Avanzada
    let settledGreaterDate = parseInt((new Date(this.balancesFormGroup.get('greaterDate')?.value).getTime() / 1).toFixed(0));
    let settledLesserDate = parseInt((new Date(this.balancesFormGroup.get('lesserDate')?.value).getTime() / 1).toFixed(0));

    if (isNaN(settledGreaterDate)) {
      settledGreaterDate = Date.parse('0');
      settledLesserDate = Date.now();
    } else if (isNaN(settledLesserDate)) {
      settledLesserDate = Date.now();
    }

    this.url = 'https://quickshopv4.diusframi.tech:39443/api/balances?&from=0&size='+this.maxRecords +'&qs={"and":[{"field":"Reference","op":"' +this.referenceSelect +'","value":"' +
      this.balancesFormGroup.get('reference')?.value.replace('/', '\\\\/') +'"},{"field":"TerminalNumber","op":"=","value":"' +this.balancesFormGroup.get('TerminalNumber')?.value +
      '"},{"field":"FinishedAt","op":"' +this.greaterThanSign +'","value":"' +settledGreaterDate +'"},{"field":"FinishedAt","op":"' +this.lesserThanSign +'","value":"' +settledLesserDate +'"}]}';

    this.qsacess.loadData(this.url).subscribe((balancesData) => {
      this.balances = balancesData;
      this.nRecords = this.balances.Data.length;
      this.loadCompleted = true;
      this.selectedItems = new Array<string>();
    });
  }
  // ---------------- Funciones ------------------

  showAdvancedSearch() {
    return (this.element = true);
  }

  hideAdvancedSearch() {
    return (this.element = false);
  }

  clearSearch() {
    window.location.reload();
  }

  getDecimal(x: any) {
    x = (x / 100).toFixed(2).replace('.', ',');
    if (x < 0) {return x;}
    return x;
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
      this.selectedCheckboxes = this.balances.Data.slice();
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
      let currentPageCheckboxes = this.balances.Data.slice((this.nPage - 1) * 10,this.nPage * 10);
      this.selectedCheckboxes = this.selectedCheckboxes.filter((item) => !currentPageCheckboxes.includes(item));
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
      let currentPageCheckboxes = this.balances.Data.slice((this.nPage - 1) * 10,this.nPage * 10);
      this.selectedCheckboxes = [...new Set([...this.selectedCheckboxes, ...currentPageCheckboxes]),];
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
