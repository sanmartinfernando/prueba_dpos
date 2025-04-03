import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  @Input() modalTitle: string = '';  // Parámetro de entrada
  @Input() modalMessage: string = '';  // Parámetro de entrada
  @Input() showModal: boolean = false;  // Variable para controlar la visibilidad
  @Output() closeModal = new EventEmitter<void>();  // Evento para cerrar el modal

  close() {
    this.closeModal.emit();
  }
}
