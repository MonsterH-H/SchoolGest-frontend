import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../ui/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {

  constructor(private dialog: MatDialog) {}

  /**
   * Ouvre une boîte de dialogue de confirmation générique
   */
  private openDialog(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '420px',
      disableClose: true,
      backdropClass: 'backdrop-blur-sm',
      panelClass: 'custom-dialog-panel'
    }).afterClosed();
  }

  /**
   * Dialogue de confirmation générique
   */
  confirm(
    title: string,
    message: string,
    options: {
      type?: 'info' | 'warning' | 'error' | 'success',
      confirmText?: string,
      cancelText?: string
    } = {}
  ): Observable<boolean> {
    const { type = 'info', confirmText = 'Confirmer', cancelText = 'Annuler' } = options;

    const iconMap: Record<string, string> = {
      success: 'check_circle',
      error: 'delete',
      warning: 'warning',
      info: 'info'
    };

    return this.openDialog({
      title,
      message,
      confirmText,
      cancelText,
      type,
      icon: iconMap[type]
    });
  }

  /**
   * Confirmation d’annulation
   */
  confirmCancel(message = 'Voulez-vous vraiment annuler ? Les modifications non enregistrées seront perdues.'): Observable<boolean> {
    return this.confirm('Annuler les modifications', message, {
      type: 'warning',
      confirmText: 'Annuler',
      cancelText: 'Oui'
    });
  }

  /**
   * Confirmation de suppression
   */
  confirmDelete(itemName = 'cet élément'): Observable<boolean> {
    return this.confirm('Confirmer la suppression', `Êtes-vous sûr de vouloir supprimer ${itemName} ? Cette action est irréversible.`, {
      type: 'error',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });
  }
}
