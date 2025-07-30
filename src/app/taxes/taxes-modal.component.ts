import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'DPOSW-taxes-modal',
  templateUrl: './taxes-modal.component.html',
  styleUrls: [ ]
})
export class TaxesModalComponent {

  constructor(public dialogRef: MatDialogRef<TaxesModalComponent>) { }

  public close(): void {
    this.dialogRef.close();
  }
}