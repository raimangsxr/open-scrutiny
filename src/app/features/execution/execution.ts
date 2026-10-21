import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VoteService, ElectionConfig, VotingItem } from '../../core/services/vote.service';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { ElectionHeaderComponent } from '../../shared/election-header/election-header';
import { ExecutionFooterComponent } from '../../shared/execution-footer/execution-footer';
import { QuestionColumnComponent } from '../../shared/question-column/question-column';
import { UndoConfirmDialogComponent } from './undo-confirm-dialog';
import {
  TotalCorrectionDialogComponent,
  TotalCorrectionDialogData,
} from './total-correction-dialog';
import { computeYAxisTicks } from '../../core/chart-axis.util';
import {
  ExecutionMenuAction,
  ExecutionOptionsDialogComponent,
} from './execution-options-dialog';
import { ConfirmActionDialogComponent } from './confirm-action-dialog';

const COLUMNS_PER_ROW = 6;

@Component({
  selector: 'app-execution',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    ElectionHeaderComponent,
    ExecutionFooterComponent,
    QuestionColumnComponent,
  ],
  templateUrl: './execution.html',
  styleUrl: './execution.css',
})
export class ExecutionComponent implements OnInit, OnDestroy {
  config: ElectionConfig | null = null;
  storageError: string | null = null;
  selectedOptions: Record<string, string> = {};
  chartData: Record<string, { name: string; value: number }[]> = {};
  yAxisTicksMap: Record<string, number[]> = {};
  questionRows: VotingItem[][] = [];

  private subscription?: Subscription;

  constructor(
    private voteService: VoteService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.subscription = combineLatest([
      this.voteService.config$,
      this.voteService.storageError$,
    ]).subscribe(([config, storageError]) => {
      this.storageError = storageError;
      if (storageError) {
        this.config = null;
        return;
      }
      if (!config) {
        this.router.navigate(['/config']);
        return;
      }
      this.config = config;
      this.rebuildQuestionRows();
      this.updateChartData();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.config || this.storageError) return;
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      this.openExecutionOptionsDialog();
    }
  }

  get canConfirmBallot(): boolean {
    return this.isBallotComplete();
  }

  get canUndoBallot(): boolean {
    return this.voteService.canUndoLastBallot();
  }

  selectOption(itemId: string, optionId: string) {
    this.selectedOptions = { ...this.selectedOptions, [itemId]: optionId };
  }

  selectedOptionFor(itemId: string): string | null {
    return this.selectedOptions[itemId] ?? null;
  }

  confirmBallot() {
    if (!this.isBallotComplete()) return;
    const ok = this.voteService.commitBallot({ ...this.selectedOptions });
    if (ok) {
      this.selectedOptions = {};
    }
  }

  requestUndo() {
    if (!this.canUndoBallot) return;
    const ref = this.dialog.open(UndoConfirmDialogComponent, { width: '24rem' });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.voteService.undoLastBallot();
      }
    });
  }

  openExecutionOptionsDialog() {
    if (!this.config) return;
    const ref = this.dialog.open(ExecutionOptionsDialogComponent, { width: '26rem' });
    ref.afterClosed().subscribe((action) => {
      if (action) {
        this.handleExecutionMenuAction(action);
      }
    });
  }

  openTotalCorrectionDialog() {
    if (!this.config) return;
    const data: TotalCorrectionDialogData = { config: this.config };
    const ref = this.dialog.open(TotalCorrectionDialogComponent, {
      data,
      width: '32rem',
      maxHeight: '90vh',
    });
    ref.afterClosed().subscribe((counts) => {
      if (counts) {
        this.voteService.applyManualCorrection(counts);
        this.selectedOptions = {};
      }
    });
  }

  private handleExecutionMenuAction(action: ExecutionMenuAction) {
    switch (action) {
      case 'clear-votes':
        this.confirmAndRun({
          title: 'Limpiar votación',
          message:
            'Se pondrán todos los conteos del escrutinio a cero. La configuración del proceso electoral no cambia.',
          confirmLabel: 'Limpiar votación',
          onConfirm: () => {
            this.voteService.clearVoteCounts();
            this.selectedOptions = {};
          },
        });
        break;
      case 'reset-config':
        this.confirmAndRun({
          title: 'Reiniciar configuración',
          message:
            'Se borrarán la configuración y todos los votos guardados. Tendrá que definir de nuevo el proceso electoral.',
          confirmLabel: 'Reiniciar',
          onConfirm: () => {
            this.voteService.reset();
            this.router.navigate(['/config']);
          },
        });
        break;
      case 'edit-config':
        this.router.navigate(['/config']);
        break;
      case 'total-correction':
        this.openTotalCorrectionDialog();
        break;
    }
  }

  private confirmAndRun(opts: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }) {
    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      width: '24rem',
      data: {
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        opts.onConfirm();
      }
    });
  }

  reconfigure() {
    this.voteService.reset();
    this.router.navigate(['/config']);
  }

  getYAxisTicks(itemId: string): number[] {
    return this.yAxisTicksMap[itemId] || [0, 1];
  }

  private isBallotComplete(): boolean {
    if (!this.config) return false;
    return this.config.votingItems.every((item) => this.selectedOptions[item.id] !== undefined);
  }

  private rebuildQuestionRows() {
    if (!this.config) {
      this.questionRows = [];
      return;
    }
    const rows: VotingItem[][] = [];
    for (let i = 0; i < this.config.votingItems.length; i += COLUMNS_PER_ROW) {
      rows.push(this.config.votingItems.slice(i, i + COLUMNS_PER_ROW));
    }
    this.questionRows = rows;
  }

  private updateChartData() {
    if (!this.config) return;

    this.config.votingItems.forEach((item) => {
      this.chartData[item.id] = item.options.map((opt) => ({
        name: opt.label,
        value: opt.count,
      }));

      const maxVotes = Math.max(...item.options.map((o) => o.count), 0);
      this.yAxisTicksMap[item.id] = computeYAxisTicks(maxVotes);
    });
  }
}
