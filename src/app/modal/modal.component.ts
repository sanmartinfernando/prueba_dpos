import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {

  @Input() modalTitle = '';
  @Input() modalMessage = '';
  @Input() showModal = false;

  // Mostrar u ocultar botones
  @Input() showAcceptButton = false;
  @Input() showCancelButton = false;

  // Eventos para comunicar con el componente padre
  @Output() closeModal = new EventEmitter<void>();
  @Output() accept = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  /** Cierra modal */
  public close(): void {
    this.closeModal.emit();
  }

  /** Aceptar acción */
  public onAccept(): void {
    this.accept.emit();
    this.close();
  }

  /** Cancelar acción */
  public onCancel(): void {
    this.cancel.emit();
    this.close();
  }
}
