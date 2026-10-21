import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export type ExecutionMenuAction =
  | 'clear-votes'
  | 'reset-config'
  | 'edit-config'
  | 'total-correction';

@Component({
  selector: 'app-execution-options-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Opciones de ejecución</h2>
    <mat-dialog-content class="options-list">
      <button mat-stroked-button type="button" (click)="choose('clear-votes')">
        Limpiar votación
      </button>
      <button mat-stroked-button type="button" (click)="choose('reset-config')">
        Reiniciar configuración
      </button>
      <button mat-stroked-button type="button" (click)="choose('edit-config')">
        Editar configuración actual
      </button>
      <button mat-stroked-button type="button" color="primary" (click)="choose('total-correction')">
        Corrección de totales
      </button>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: min(22rem, 90vw);
      padding-top: 0.25rem;
    }
    .options-list button {
      width: 100%;
      justify-content: flex-start;
    }
  `,
})
export class ExecutionOptionsDialogComponent {
  constructor(public dialogRef: MatDialogRef<ExecutionOptionsDialogComponent, ExecutionMenuAction | undefined>) {}

  choose(action: ExecutionMenuAction) {
    this.dialogRef.close(action);
  }
}
