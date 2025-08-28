import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { Modifier } from '../_models/modifiers.model';
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
  public commerceId: string;
  public idModifier: string;
  public modifier: Modifier;

  public modifiersForm: FormGroup;

  savedModifiers: Modifier;

  public isLoading = false;
  public showModal = false;
  public modalTitle = '';
  public modalMessage = '';

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idModifier = this.data.id;
    this.modifiersForm = this.fb.group({
      modifierName: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ ]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier1: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier2: ['', [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier3: ['', [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier4: ['', [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier5: ['', [Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
    });
  }

  /**
   * Inicializa el modal cargando datos según corresponda.
   */
  ngOnInit(): void {
    this.commerceId = this.sessionService.getItem(SessionService.COMMERCE_ID);
    if (this.idModifier) {
      this.getModifiers();
      this.titlePage = this.translate.instant('dpos.modifiers-modal.title.edit');
      
    } else {
      this.titlePage = this.translate.instant('dpos.modifiers-modal.title.add');
      this.isLoading = false;
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
    this.isLoading = true;
    this.productsService.getModifier(this.idModifier, this.commerceId).subscribe({
      next: (modifier) => {
        this.modifier = modifier;
        this.modifiersForm.setValue({ modifierName: this.modifier.modifierName, modifier1: this.modifier.modifierOptions[0] ?? "", modifier2: this.modifier.modifierOptions[1] ?? "",
                                      modifier3: this.modifier.modifierOptions[2] ?? "", modifier4: this.modifier.modifierOptions[3] ?? "", modifier5: this.modifier.modifierOptions[4] ?? ""});
        this.isLoading = false;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.modifiers.detail'));
        this.isLoading = false;
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
    if (this.modifier) {
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
    this.isLoading = true;
    this.productsService.saveModifier(this.modifier, this.commerceId).subscribe({
      next: (savedModifier) => {
        this.openModal(this.translate.instant('dpos.modifiers-modal.modal.edit.title'), this.translate.instant('dpos.modifiers-modal.modal.edit.message'));
        this.savedModifiers = savedModifier;
        this.isLoading = false;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.modifiers.updates'));
        this.savedModifiers = null;
        this.isLoading = true;
      }
    });
  }

  /**
   * Crea una nuevo modificador.
   */
  private createModifiers(): void {
    this.modifier = new Modifier();
    this.setModifiersFields();
    this.isLoading = true;
    this.productsService.saveModifier(this.modifier, this.commerceId).subscribe({
      next: (savedModifier) => {
        this.openModal(this.translate.instant('dpos.modifiers-modal.modal.create.title'), this.translate.instant('dpos.modifiers-modal.modal.create.message'));
        this.savedModifiers = savedModifier;
        this.isLoading = false;
      },
      error: () => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.modifiers.create'));
        this.savedModifiers = null;
        this.isLoading = false;
      }
    });
  }

  /**
   * Asigna al modelo de modificadores los valores actuales del formulario.
   */
  private setModifiersFields(): void {
    this.modifier.modifierName = this.modifiersForm.get('modifierName').value
    const modifiers: string[] = [
                                this.modifiersForm.get('modifier1')?.value,
                                this.modifiersForm.get('modifier2')?.value,
                                this.modifiersForm.get('modifier3')?.value,
                                this.modifiersForm.get('modifier4')?.value,
                                this.modifiersForm.get('modifier5')?.value,
                              ].filter(value => value !== null && value !== undefined && value !== '');
    this.modifier.modifierOptions = modifiers;
  }
}
