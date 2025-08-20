import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../_services/auth.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { Modifiers } from '../_models/modifiers.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../_services/products.service';

/**
 * Modal para gestionar modificadores de productos, permitiendo
 * agregar o editarlos y cerrar el diálogo.
 */
@Component({
  selector: 'app-dpos-modifiers-modal',
  templateUrl: './modifiers-modal.component.html',
  styleUrls: []
})
export class ModifiersModalComponent implements OnInit {

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private portalUsersService = inject(PortalUsersService);
  private productsService = inject(ProductsService);
  private sessionService = inject(SessionService);
  private storageService = inject(StorageService);
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

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idModifiers = this.data.id;
    this.modifiersForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'' -]{0,98}[A-Za-zÀ-ÖØ-öø-ÿ]$/)]],
      modifier1: [''],
      modifier2: [''],
      modifier3: [''],
      modifier4: [''],
      modifier5: [''],
    });
  }

  /**
   * Inicializa el modal cargando datos según corresponda.
   */
  ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
          this.authService.setPortalUsersToken(portalUserToken.token);
          this.commerceId = this.sessionService.getItem(SessionService.COMMERCE_ID);
          if (this.idModifiers) {
            this.getModifiers();
            this.titlePage = this.translate.instant('dpos.modifiers-modal.title.edit');
            
          } else {
            this.titlePage = this.translate.instant('dpos.modifiers-modal.title.add');
            this.loadCompleted = true;
          }
        },
        error: (error) => {
          console.error('Error Portal user token', error);
        }
      });
    });
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
   * Actualiza un modificador existente.
   */
  private updateModifiers(): void {
    this.setModifiersFields();
    this.productsService.saveModifier(this.modifiers, this.commerceId).subscribe({
      next: () => this.dialogRef.close(),
      error: () => this.dialogRef.close()
    });
  }

  /**
   * Crea una nuevo modificador.
   */
  private createModifiers(): void {
    this.modifiers = new Modifiers();
    this.setModifiersFields();
    this.productsService.saveModifier(this.modifiers, this.commerceId).subscribe({
      next: () => this.dialogRef.close(),
      error: () => this.dialogRef.close()
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
