import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-execution-footer',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './execution-footer.html',
  styleUrl: './execution-footer.css',
})
export class ExecutionFooterComponent {
  @Input() canConfirm = false;
  @Input() canUndo = false;

  @Output() confirmBallot = new EventEmitter<void>();
  @Output() undoBallot = new EventEmitter<void>();
}
