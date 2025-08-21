import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * @class ModalComponent
 * @description
 * Componente de modal reutilizable que muestra un título, un mensaje
 * y permite cerrar el modal mediante un evento de salida.
 */
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {

  @Input() modalTitle = '';
  @Input() modalMessage = '';
  @Input() showModal = false;

  @Output() closeModal = new EventEmitter<void>();

  /**
   * Emite el evento para cerrar el modal.
   */
  public close(): void {
    this.closeModal.emit();
  }
}
