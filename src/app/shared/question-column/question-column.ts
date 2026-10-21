import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { VotingItem } from '../../core/services/vote.service';
import { maxCharsPerBand } from '../../core/chart-axis.util';

@Component({
  selector: 'app-question-column',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './question-column.html',
  styleUrl: './question-column.css',
})
export class QuestionColumnComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) item!: VotingItem;
  @Input() chartResults: { name: string; value: number }[] = [];
  @Input() yAxisTicks: number[] = [0, 1];
  @Input() selectedOptionId: string | null = null;

  @Output() optionSelected = new EventEmitter<string>();

  @ViewChild('chartWrapper') chartWrapper?: ElementRef<HTMLElement>;

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  showYAxisLabel = true;
  yAxisLabel = 'Votos';
  colorScheme = 'vivid';
  showDataLabel = true;
  trimXAxisTicks = false;
  rotateXAxisTicks = false;
  wrapTicks = true;
  maxXAxisTickLength = 6;
  barPadding = 12;

  private resizeObserver?: ResizeObserver;

  ngOnChanges() {
    this.updateXAxisTickLength();
  }

  ngAfterViewInit() {
    const el = this.chartWrapper?.nativeElement;
    if (!el || typeof ResizeObserver === 'undefined') {
      this.updateXAxisTickLength();
      return;
    }
    this.resizeObserver = new ResizeObserver(() => this.updateXAxisTickLength());
    this.resizeObserver.observe(el);
    this.updateXAxisTickLength();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  totalVotes(): number {
    return this.item.options.reduce((sum, o) => sum + o.count, 0);
  }

  isPressed(optionId: string): boolean {
    return this.selectedOptionId === optionId;
  }

  onOptionClick(optionId: string) {
    this.optionSelected.emit(optionId);
  }

  private updateXAxisTickLength() {
    const width = this.chartWrapper?.nativeElement?.clientWidth ?? 0;
    const bandCount = this.item?.options.length ?? 0;
    this.maxXAxisTickLength = maxCharsPerBand(width, bandCount);
  }
}
