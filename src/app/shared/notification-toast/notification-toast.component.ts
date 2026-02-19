import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { NotificationService } from '../../core/services/notification.service';
import { Toast } from '../models/toast.model';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.23, 1, 0.32, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          stagger(100, animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class NotificationToastComponent implements OnInit {
  private notificationService = inject(NotificationService);
  toasts$ = this.notificationService.toasts$;

  ngOnInit(): void { }

  remove(id: number): void {
    this.notificationService.removeToast(id);
  }

  trackById(index: number, item: Toast): number {
    return item.id;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'M5 13l4 4L19 7';
      case 'error': return 'M6 18L18 6M6 6l12 12';
      case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info': return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-white border-emerald-500 text-emerald-800';
      case 'error': return 'bg-white border-rose-500 text-rose-800';
      case 'warning': return 'bg-white border-amber-500 text-amber-800';
      case 'info': return 'bg-white border-blue-500 text-blue-800';
      default: return 'bg-white border-gray-500 text-gray-800';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-50 text-emerald-500';
      case 'error': return 'bg-rose-50 text-rose-500';
      case 'warning': return 'bg-amber-50 text-amber-500';
      case 'info': return 'bg-blue-50 text-blue-500';
      default: return 'bg-gray-50 text-gray-500';
    }
  }
}
