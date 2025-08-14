import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../_services/auth.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { Modifiers } from '../_models/modifiers.model';

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
  private portalUsersService = inject(PortalUsersService);
  private sessionService = inject(SessionService);
  private storageService = inject(StorageService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  public dialogRef = inject(MatDialogRef<ModifiersModalComponent>);
  public data = inject<{ id?: string }>(MAT_DIALOG_DATA);

  public titlePage: string;
  public idModifiers: string;
  public modifiers: Modifiers;

  public modifiersFormData = {
    name: '',
    modifier1: '',
    modifier2: '',
    modifier3: '',
    modifier4: '',
    modifier5: ''
  };

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idModifiers = this.data.id;
  }

  /**
   * Inicializa el modal cargando datos según corresponda.
   */
  ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) => {
      this.portalUsersService.getToken(user).subscribe({
        next: (portalUserToken) => {
          this.authService.setPortalUsersToken(portalUserToken.token);
          if (this.idModifiers) {
            this.titlePage = this.translate.instant('dpos.modifiers-modal.title.edit');
            this.getModifiers();
          } else {
            this.titlePage = this.translate.instant('dpos.modifiers-modal.title.add');
          }
        },
        error: (error) => {
          console.error('Error Portal user token', error);
        }
      });
    });
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
   * Obtiene los datos de modificadores existentes.
   */
  private getModifiers(): void {
    this.loadModifiersData();
  }

  /**
   * Carga datos de modificadores en el formulario.
   */
  private loadModifiersData(): void {
    this.modifiersFormData = {
      name: 'Punto de la Carne',
      modifier1: 'Muy crudo',
      modifier2: 'Crudo',
      modifier3: 'Al punto',
      modifier4: 'Pasado',
      modifier5: 'Quemado'
    };
  }
}
