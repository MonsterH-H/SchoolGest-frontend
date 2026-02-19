import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast, ToastType } from '../../shared/models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toasts: Toast[] = [];
  private toastSubject = new BehaviorSubject<Toast[]>([]);
  toasts$: Observable<Toast[]> = this.toastSubject.asObservable();
  private nextId = 0;

  constructor() { }

  showNotification(message: string, type: ToastType = 'info', duration: number = 5000): void {
    const id = this.nextId++;
    const toast: Toast = { id, message, type, duration };

    this.toasts = [...this.toasts, toast];
    this.toastSubject.next(this.toasts);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  showSuccess(message: string): void {
    this.showNotification(message, 'success');
  }

  showError(message: string): void {
    this.showNotification(message, 'error');
  }

  showWarning(message: string): void {
    this.showNotification(message, 'warning');
  }

  showInfo(message: string): void {
    this.showNotification(message, 'info');
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastSubject.next(this.toasts);
  }
}