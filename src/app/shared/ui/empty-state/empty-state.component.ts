
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() message: string = 'Aucune donnée à afficher';
  @Input() buttonText?: string;
  @Output() action = new EventEmitter<void>();

  onButtonClick() {
    this.action.emit();
  }
}
