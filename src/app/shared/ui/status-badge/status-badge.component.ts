
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent implements OnChanges {
  @Input() text: string = '';
  @Input() type: BadgeType = 'neutral';

  badgeClasses: string = '';

  ngOnChanges(): void {
    this.updateBadgeClasses();
  }

  private updateBadgeClasses(): void {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const typeClasses = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    this.badgeClasses = `${baseClasses} ${typeClasses[this.type]}`;
  }
}
