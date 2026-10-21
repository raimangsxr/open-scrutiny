import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VoteService, ElectionConfig, VotingItem } from '../../core/services/vote.service';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-execution',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxChartsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './execution.html',
  styleUrl: './execution.css',
})
export class ExecutionComponent implements OnInit, OnDestroy {
  config: ElectionConfig | null = null;
  storageError: string | null = null;
  selectedOptions: { [itemId: string]: string } = {};
  manualCounts: { [itemId: string]: { [optionId: string]: number } } = {};
  chartData: { [itemId: string]: { name: string; value: number }[] } = {};

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Opciones';
  showYAxisLabel = true;
  yAxisLabel = 'Votos';
  colorScheme: string | unknown = 'vivid';

  yAxisTicksMap: { [itemId: string]: number[] } = {};

  private subscription?: Subscription;

  constructor(
    private voteService: VoteService,
    private router: Router
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
      this.syncManualCountsFromConfig();
      this.updateChartData();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private syncManualCountsFromConfig() {
    if (!this.config) return;
    this.manualCounts = {};
    this.config.votingItems.forEach((item) => {
      this.manualCounts[item.id] = {};
      item.options.forEach((opt) => {
        this.manualCounts[item.id][opt.id] = opt.count;
      });
    });
  }

  updateChartData() {
    if (!this.config) return;

    this.config.votingItems.forEach((item) => {
      this.chartData[item.id] = item.options.map((opt) => ({
        name: opt.label,
        value: opt.count,
      }));

      const maxVotes = Math.max(...item.options.map((o) => o.count), 1);
      this.yAxisTicksMap[item.id] = Array.from({ length: maxVotes + 1 }, (_, i) => i);
    });
  }

  getYAxisTicks(itemId: string): number[] {
    return this.yAxisTicksMap[itemId] || [0, 1];
  }

  selectOption(itemId: string, optionId: string) {
    this.selectedOptions[itemId] = optionId;
  }

  isOptionSelected(itemId: string, optionId: string): boolean {
    return this.selectedOptions[itemId] === optionId;
  }

  hasAnySelection(): boolean {
    if (!this.config) return false;
    return this.config.votingItems.every((item) => this.selectedOptions[item.id] !== undefined);
  }

  saveAllVotes() {
    Object.entries(this.selectedOptions).forEach(([itemId, optionId]) => {
      this.voteService.saveVote(itemId, optionId);
    });
    this.selectedOptions = {};
    this.syncManualCountsFromConfig();
    this.updateChartData();
  }

  applyManualCounts() {
    if (!this.config) return;
    this.config.votingItems.forEach((item) => {
      item.options.forEach((opt) => {
        const value = this.manualCounts[item.id]?.[opt.id];
        this.voteService.setOptionCount(item.id, opt.id, value ?? 0);
      });
    });
    this.syncManualCountsFromConfig();
    this.updateChartData();
  }

  reconfigure() {
    this.voteService.reset();
    this.router.navigate(['/config']);
  }

  getTotalVotes(item: VotingItem): number {
    return item.options.reduce((acc, curr) => acc + curr.count, 0);
  }
}
