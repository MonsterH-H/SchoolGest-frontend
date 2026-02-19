import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface AppCardAction {
  label: string;
  icon?: string;
  action: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
}

export interface AppCardMenuItem {
  label: string;
  icon?: string;
  action: string;
  disabled?: boolean;
  divider?: boolean;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './app-card.component.html',
  styleUrl: './app-card.component.scss'

})
export class AppCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() titleTooltip: string = '';
  @Input() content: string = '';
  @Input() footerText: string = '';
  
  @Input() avatar: string = '';
  @Input() icon: string = '';
  @Input() iconColor: string = '#dc2626';
  
  @Input() clickable: boolean = false;
  @Input() selected: boolean = false;
  @Input() disabled: boolean = false;
  @Input() compact: boolean = false;
  @Input() noPadding: boolean = false;
  @Input() cardClass: string = '';
  
  @Input() progress: number | undefined = undefined;
  
  @Input() badge: {
    value: string | number;
    icon?: string;
    color?: 'primary' | 'accent' | 'warn';
  } | null = null;
  
  @Input() status: {
    type: 'success' | 'warning' | 'error' | 'info';
    text: string;
    icon?: string;
  } | null = null;
  
  @Input() actions: AppCardAction[] = [];
  @Input() headerActions: AppCardAction[] = [];
  @Input() menuItems: AppCardMenuItem[] = [];
  @Input() actionsAlign: 'start' | 'end' = 'end';
  
  @Input() keyValuePairs: {
    key: string;
    value: string;
    valueClass?: string;
    highlighted?: boolean;
  }[] = [];
  
  @Input() stats: {
    label: string;
    value: string | number;
    color?: string;
  }[] = [];
  
  @Output() cardClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<string>();

  get showHeader(): boolean {
    return !!(this.title || this.subtitle || this.avatar || this.icon || 
              this.headerActions.length > 0 || this.menuItems.length > 0 ||
              this.status || this.badge);
  }

  onCardClick(): void {
    if (this.clickable && !this.disabled) {
      this.cardClick.emit();
    }
  }

  onActionClick(action: string): void {
    this.actionClick.emit(action);
  }
}