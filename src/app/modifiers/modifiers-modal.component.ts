import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { Modifiers } from '../_models/modifiers.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../_services/products.service';

/**
 * @class ModifiersModalComponent
 * @description
 * Modal para gestionar modificadores de productos, permitiendo
 * agregar o editarlos y cerrar el diálogo.
 */
@Component({
  selector: 'app-dpos-modifiers-modal',
  templateUrl: './modifiers-modal.component.html',
  styleUrls: []
})
export class ModifiersModalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  public dialogRef = inject(MatDialogRef<ModifiersModalComponent>);
  public data = inject<{ id?: string }>(MAT_DIALOG_DATA);

  public titlePage: string;
  public loadCompleted = false;
  public commerceId: string;
  public idModifiers: string;
  public modifiers: Modifiers;

  public modifiersForm: FormGroup;

  savedModifiers: Modifiers;

  public showModal = false;
  public modalTitle = '';
  public modalMessage = '';

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idModifiers = this.data.id;
    this.modifiersForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier1: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier2: ['', [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier3: ['', [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier4: ['', [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier5: ['', [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
    });
  }

  /**
   * Inicializa el modal cargando datos según corresponda.
   */
  ngOnInit(): void {
    this.commerceId = this.sessionService.getItem(SessionService.COMMERCE_ID);
    if (this.idModifiers) {
      this.getModifiers();
      this.titlePage = this.translate.instant('dpos.modifiers-modal.title.edit');
      
    } else {
      this.titlePage = this.translate.instant('dpos.modifiers-modal.title.add');
      this.loadCompleted = true;
    }
  }

  /**
   * Cierra el modal sin guardar cambios.
   */
  public close(): void {
    this.dialogRef.close();
  }

  /**
   * Obtiene los datos de modificadores existentes.
   */
  private getModifiers(): void {
    this.productsService.getModifier(this.idModifiers, this.commerceId).subscribe({
      next: (modifier) => {
        this.modifiers = modifier;
        this.modifiersForm.setValue({ name: this.modifiers.name, modifier1: this.modifiers.modifiers[0] ?? "", modifier2: this.modifiers.modifiers[1] ?? "",
                                      modifier3: this.modifiers.modifiers[2] ?? "", modifier4: this.modifiers.modifiers[3] ?? "", modifier5: this.modifiers.modifiers[4] ?? ""});
        this.loadCompleted = true;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.modifiers.detail'));
        this.loadCompleted = true;
      }
    });
  }
  
  /**
   * Envía el formulario y cierra el modal.
   */
  public saveModifiers(): void {
    if (this.modifiersForm.invalid) {
      this.modifiersForm.markAllAsTouched();
      return;
    }
    if (this.modifiers) {
      this.updateModifiers();
    } else {
      this.createModifiers();
    }
  }

  /**
   * Abre el modal de mensajes estableciendo el título y el mensaje.
   *
   * @param title   Texto que se mostrará como título del modal.
   * @param message Texto que se mostrará como contenido del modal.
   */
  public openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  /**
   * Cierra el modal de mensajes.
   */
  public closeModal(): void {
    this.showModal = false;
    this.dialogRef.close(this.savedModifiers);
  }

  /**
   * Actualiza un modificador existente.
   */
  private updateModifiers(): void {
    this.setModifiersFields();
    this.productsService.saveModifier(this.modifiers, this.commerceId).subscribe({
      next: (savedModifier) => {
        this.openModal(this.translate.instant('dpos.modifiers-modal.modal.edit.title'), this.translate.instant('dpos.modifiers-modal.modal.edit.message'));
        this.savedModifiers = savedModifier;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.modifiers.updates'));
        this.savedModifiers = null;
      }
    });
  }

  /**
   * Crea una nuevo modificador.
   */
  private createModifiers(): void {
    this.modifiers = new Modifiers();
    this.setModifiersFields();
    this.productsService.saveModifier(this.modifiers, this.commerceId).subscribe({
      next: (savedModifier) => {
        this.openModal(this.translate.instant('dpos.modifiers-modal.modal.create.title'), this.translate.instant('dpos.modifiers-modal.modal.create.message'));
        this.savedModifiers = savedModifier;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.modifiers.create'));
        this.savedModifiers = null;
      }
    });
  }

  /**
   * Asigna al modelo de modificadores los valores actuales del formulario.
   */
  private setModifiersFields(): void {
    this.modifiers.name = this.modifiersForm.get('name').value
    const modifiers: string[] = [
                                this.modifiersForm.get('modifier1')?.value,
                                this.modifiersForm.get('modifier2')?.value,
                                this.modifiersForm.get('modifier3')?.value,
                                this.modifiersForm.get('modifier4')?.value,
                                this.modifiersForm.get('modifier5')?.value,
                              ].filter(value => value !== null && value !== undefined && value !== '');
    this.modifiers.modifiers = modifiers;
  }
}
