import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true // Make it standalone for consistency
})
export class StatusLabelPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    switch (value.toLowerCase()) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'expired':
        return 'Expiré';
      case 'validated':
        return 'Validé';
      case 'rejected':
        return 'Rejeté';
      case 'paid':
        return 'Payé';
      case 'unpaid':
        return 'Non payé';
      default:
        return value; // Return original value if no mapping found
    }
  }
}
