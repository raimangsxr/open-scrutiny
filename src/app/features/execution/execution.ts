import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { VoteService, ElectionConfig, VotingItem } from '../../core/services/vote.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-execution',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './execution.html',
  styleUrl: './execution.css'
})
export class ExecutionComponent implements OnInit {
  config: ElectionConfig | null = null;
  selectedOptions: { [itemId: string]: string } = {};
  chartData: { [itemId: string]: any[] } = {};

  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Opciones';
  showYAxisLabel = true;
  yAxisLabel = 'Votos';
  colorScheme: string | any = 'vivid';

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
    });
  }

  selectOption(itemId: string, optionId: string) {
    this.selectedOptions[itemId] = optionId;
  }

  saveVote(itemId: string) {
    const selectedOptionId = this.selectedOptions[itemId];
    if (selectedOptionId) {
      this.voteService.saveVote(itemId, selectedOptionId);
      delete this.selectedOptions[itemId]; // Clear selection after saving
    }
  }

  getTotalVotes(item: VotingItem): number {
    return item.options.reduce((acc, curr) => acc + curr.count, 0);
  }
}
