import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Alert } from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'info',
      title: 'Nouveau cours ajouté',
      message: 'Une nouvelle séance de Mathématiques a été ajoutée à votre emploi du temps.',
      date: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Devoir à rendre bientôt',
      message: 'Le devoir de Physique-Chimie doit être rendu avant demain 18h.',
      date: new Date(),
      read: false
    },
    {
      id: '3',
      type: 'error',
      title: 'Absence signalée',
      message: 'Une absence a été enregistrée pour le cours de Français du 28/12.',
      date: new Date(),
      read: true
    },
    {
      id: '4',
      type: 'success',
      title: 'Note publiée',
      message: 'Votre note pour le contrôle de SVT est disponible dans votre espace.',
      date: new Date(),
      read: false
    }
  ];

  constructor() { }

  getAlerts(): Observable<Alert[]> {
    return of(this.mockAlerts);
  }

  markAlertAsRead(alertId: string): Observable<boolean> {
    const alert = this.mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      return of(true);
    }
    return of(false);
  }

  deleteAlert(alertId: string): Observable<boolean> {
    const initialLength = this.mockAlerts.length;
    this.mockAlerts = this.mockAlerts.filter(a => a.id !== alertId);
    return of(this.mockAlerts.length < initialLength);
  }
}
