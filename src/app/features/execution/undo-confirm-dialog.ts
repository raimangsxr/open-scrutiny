import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-undo-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Deshacer última papeleta</h2>
    <mat-dialog-content>
      <p>Se eliminará del escrutinio la última papeleta contabilizada. ¿Continuar?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close(false)">Cancelar</button>
      <button mat-raised-button color="warn" type="button" (click)="dialogRef.close(true)">
        Deshacer
      </button>
    </mat-dialog-actions>
  `,
})
export class UndoConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<UndoConfirmDialogComponent, boolean>) {}
}
