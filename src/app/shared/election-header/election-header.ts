import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-election-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './election-header.html',
  styleUrl: './election-header.css',
})
export class ElectionHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() logoUrl: string | null = null;
}
