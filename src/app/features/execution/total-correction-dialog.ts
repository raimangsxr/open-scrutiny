import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ElectionConfig } from '../../core/services/vote.service';

export interface TotalCorrectionDialogData {
  config: ElectionConfig;
}

@Component({
  selector: 'app-total-correction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Corrección de totales</h2>
    <mat-dialog-content class="correction-content">
      <p class="correction-intro">Ajuste manual de emergencia. Al aplicar, no podrá deshacer la última papeleta.</p>
      <section *ngFor="let item of data.config.votingItems" class="correction-item">
        <h3>{{ item.question }}</h3>
        <div class="correction-row" *ngFor="let option of item.options">
          <span class="option-label">{{ option.label }}</span>
          <mat-form-field appearance="outline" class="count-field">
            <mat-label>Votos</mat-label>
            <input
              matInput
              type="number"
              min="0"
              step="1"
              [(ngModel)]="counts[item.id][option.id]"
              [name]="item.id + '-' + option.id"
            />
          </mat-form-field>
        </div>
      </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" type="button" (click)="apply()">
        Aplicar corrección
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .correction-content {
      min-width: min(28rem, 90vw);
      max-height: 70vh;
    }
    .correction-intro {
      font-size: 0.9rem;
      color: #555;
    }
    .correction-item h3 {
      margin: 1rem 0 0.5rem;
      font-size: 1rem;
    }
    .correction-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }
    .option-label {
      min-width: 4rem;
      font-weight: 500;
    }
    .count-field {
      flex: 1;
      max-width: 8rem;
    }
  `,
})
export class TotalCorrectionDialogComponent implements OnInit {
  counts: Record<string, Record<string, number>> = {};

  constructor(
    public dialogRef: MatDialogRef<TotalCorrectionDialogComponent, Record<string, Record<string, number>> | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: TotalCorrectionDialogData
  ) {}

  ngOnInit() {
    this.data.config.votingItems.forEach((item) => {
      this.counts[item.id] = {};
      item.options.forEach((opt) => {
        this.counts[item.id][opt.id] = opt.count;
      });
    });
  }

  apply() {
    this.dialogRef.close(this.counts);
  }
}
