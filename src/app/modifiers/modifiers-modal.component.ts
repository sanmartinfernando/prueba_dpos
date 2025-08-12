import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../_services/auth.service';
import { PortalUsersService } from '../_services/portal-users.service';
import { SessionService } from '../_services/session.service';
import { StorageService } from '../_services/storage.service';
import { ThemeService } from '../_services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { Modifiers } from '../_models/modifiers.model';


@Component({
  selector: 'app-dpos-modifiers-modal',
  templateUrl: './modifiers-modal.component.html',
  styleUrls: []
})
export class ModifiersModalComponent implements OnInit {

  private portalUsersService = inject(PortalUsersService);
  private storageService = inject(StorageService);
  private sessionService = inject(SessionService);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  public dialogRef = inject(MatDialogRef<ModifiersModalComponent>);
  public data = inject<{ id?: string }>(MAT_DIALOG_DATA);
  


  titlePage: string;
  idModifiers: string;
  modifiersFormData = {
    name: '',
    modifier1: '',
    modifier2: '',
    modifier3: '',
    modifier4: '',
    modifier5: ''
  };

  modifiers: Modifiers;

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.idModifiers = this.data.id;
  }

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
          console.error("Error Portal user token", error);
        }
      });
    });
  }

  public onSubmit() {
    this.dialogRef.close();
  }

  public close(): void {
    this.dialogRef.close();
  }

  private getModifiers() {
    this.loadModifiersData();
  }

  private loadModifiersData() {
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