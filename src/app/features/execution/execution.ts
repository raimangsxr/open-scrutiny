import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VoteService, ElectionConfig, VotingItem } from '../../core/services/vote.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-execution',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './execution.html',
  styleUrl: './execution.css'
})
export class ExecutionComponent implements OnInit {
  config: ElectionConfig | null = null;
  selectedOptions: { [itemId: string]: string } = {};
  chartData: { [itemId: string]: any[] } = {};

  // Chart options - responsive to container size
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Opciones';
  showYAxisLabel = true;
  yAxisLabel = 'Votos';
  colorScheme: string | any = 'vivid';

  // Y-axis ticks per voting item
  yAxisTicksMap: { [itemId: string]: number[] } = {};

  constructor(private voteService: VoteService, private router: Router) { }

  ngOnInit() {
    this.voteService.config$.subscribe(config => {
      if (!config) {
        this.router.navigate(['/config']);
        return;
      }
      this.config = config;
      this.updateChartData();
    });
  }

  updateChartData() {
    if (!this.config) return;

    this.config.votingItems.forEach(item => {
      this.chartData[item.id] = item.options.map(opt => ({
        name: opt.label,
        value: opt.count
      }));

      // Calculate integer ticks for Y axis specific to this item
      const maxVotes = Math.max(...item.options.map(o => o.count), 1);
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
    // Check that ALL voting items have a selection
    return this.config.votingItems.every(item =>
      this.selectedOptions[item.id] !== undefined
    );
  }

  saveAllVotes() {
    Object.entries(this.selectedOptions).forEach(([itemId, optionId]) => {
      this.voteService.saveVote(itemId, optionId);
    });
    this.selectedOptions = {}; // Clear all selections after saving
  }

  getTotalVotes(item: VotingItem): number {
    return item.options.reduce((acc, curr) => acc + curr.count, 0);
  }
}
