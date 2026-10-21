import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatButtonModule } from '@angular/material/button';
import { VotingItem } from '../../core/services/vote.service';

@Component({
  selector: 'app-question-column',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatButtonModule],
  templateUrl: './question-column.html',
  styleUrl: './question-column.css',
})
export class QuestionColumnComponent {
  @Input({ required: true }) item!: VotingItem;
  @Input() chartResults: { name: string; value: number }[] = [];
  @Input() yAxisTicks: number[] = [0, 1];
  @Input() selectedOptionId: string | null = null;

  @Output() optionSelected = new EventEmitter<string>();

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Opciones';
  showYAxisLabel = true;
  yAxisLabel = 'Votos';
  colorScheme = 'vivid';

  totalVotes(): number {
    return this.item.options.reduce((sum, o) => sum + o.count, 0);
  }

  isPressed(optionId: string): boolean {
    return this.selectedOptionId === optionId;
  }

  onOptionClick(optionId: string) {
    this.optionSelected.emit(optionId);
  }
}
