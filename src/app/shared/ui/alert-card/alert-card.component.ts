
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type AlertType = 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-alert-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-card.component.html',
  styleUrls: ['./alert-card.component.scss']
})
export class AlertCardComponent {
  @Input() message: string = '';
  @Input() type: AlertType = 'info';

  get cardClasses(): string {
    let classes = 'p-4 rounded-lg shadow-sm';
    switch (this.type) {
      case 'success':
        classes += ' bg-green-100 text-green-800 border border-green-200';
        break;
      case 'warning':
        classes += ' bg-yellow-100 text-yellow-800 border border-yellow-200';
        break;
      case 'error':
        classes += ' bg-red-100 text-red-800 border border-red-200';
        break;
      case 'info':
        classes += ' bg-blue-100 text-blue-800 border border-blue-200';
        break;
    }
    return classes;
  }

  get iconClasses(): string {
    let classes = 'mr-3';
    switch (this.type) {
      case 'success':
        classes += ' text-green-500';
        break;
      case 'warning':
        classes += ' text-yellow-500';
        break;
      case 'error':
        classes += ' text-red-500';
        break;
      case 'info':
        classes += ' text-blue-500';
        break;
    }
    return classes;
  }

  get iconName(): string {
    switch (this.type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }
}
