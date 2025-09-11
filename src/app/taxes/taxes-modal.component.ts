import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { Tax } from '../_models/tax.model';

/**
 * @class TaxesModalComponent
 * @description
 * Componente modal para crear o editar impuestos.
 * Permite configurar tipo, nombre y valor del impuesto.
 */
@Component({
  selector: 'app-dpos-taxes-modal',
  templateUrl: './taxes-modal.component.html',
  styleUrls: []
})
export class TaxesModalComponent implements OnInit {

  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  public dialogRef = inject(MatDialogRef<TaxesModalComponent>);
  public data = inject<{ id?: number }>(MAT_DIALOG_DATA);

  public titlePage: string;
  public idTax: number;
  public Tax: Tax;
  public isTaxNameDisabled = true;
  public isTaxValueDisabled = true;

  public taxFormData = {
    taxType: '-1',
    taxName: 'EXENTO',
    taxValue: 0
  };

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idTax = this.data.id;
  }

  /**
   * Inicializa el modal, cargando datos si se está editando un impuesto.
   */
  ngOnInit(): void {
    if (this.idTax) {
      this.titlePage = this.translate.instant('dpos.taxes.modal.title.edit');
      this.getTax();
    } else {
      this.titlePage = this.translate.instant('dpos.taxes.modal.title.add');
    }
  }

  /**
   * Actualiza el formulario según el tipo de impuesto seleccionado.
   */
  public updateTaxForm(): void {
    if (this.taxFormData.taxType === '-1') {
      this.taxFormData = { taxType: '-1', taxName: 'EXENTO', taxValue: 0 };
      this.isTaxNameDisabled = true;
      this.isTaxValueDisabled = true;
    } else if (this.taxFormData.taxType === '-2') {
      this.taxFormData = { taxType: '-2', taxName: 'NO SUJETO', taxValue: 0 };
      this.isTaxNameDisabled = true;
      this.isTaxValueDisabled = true;
    } else {
      this.taxFormData = { taxType: this.taxFormData.taxType, taxName: '', taxValue: 0 };
      this.isTaxNameDisabled = false;
      this.isTaxValueDisabled = false;
    }
  }

  /**
   * Envía el formulario y cierra el modal.
   */
  public onSubmit(): void {
    this.dialogRef.close();
  }

  /**
   * Cierra el modal sin guardar cambios.
   */
  public close(): void {
    this.dialogRef.close();
  }

  /**
   * Obtiene los datos del impuesto a editar.
   */
  private getTax(): void {
    this.loadTaxData();
  }

  /**
   * Carga datos de ejemplo para el impuesto.
   */
  private loadTaxData(): void {
    this.taxFormData = { taxType: '0', taxName: 'IVA 10%', taxValue: 1000 };
    this.isTaxNameDisabled = false;
    this.isTaxValueDisabled = false;
  }

  /**
   * Devuelve el valor del impuesto formateado en porcentaje.
   */
  get taxValueDisplay(): string {
    return (this.taxFormData.taxValue / 100).toFixed(2) + '%';
  }

  /**
   * Asigna el valor del impuesto a partir de un porcentaje formateado.
   */
  set taxValueDisplay(displayValue: string) {
    const clean = displayValue.replace('%', '').replace(',', '.');
    const parsed = parseFloat(clean);
    if (!isNaN(parsed)) {
      this.taxFormData.taxValue = parsed * 100;
    }
  }
}
