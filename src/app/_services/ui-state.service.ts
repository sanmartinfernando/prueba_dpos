import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * @class UIStateService
 * @description
 * Servicio encargado de gestionar y exponer el estado de la interfaz de usuario
 * relacionado con la habilitación del selector de formularios.
 */
@Injectable({ providedIn: 'root' })
export class UIStateService {

  private formSelectEnabled = new BehaviorSubject<boolean>(true);
  public formSelectEnabled$ = this.formSelectEnabled.asObservable();

  /**
   * Actualiza el estado de habilitación del selector de formularios.
   * 
   * @param enabled Indica si el selector de formularios debe estar habilitado.
   */
  public setFormSelectEnabled(enabled: boolean): void {
    this.formSelectEnabled.next(enabled);
  }
}
