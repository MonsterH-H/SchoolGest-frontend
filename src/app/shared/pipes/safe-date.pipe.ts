import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeDate',
  standalone: true
})
export class SafeDatePipe implements PipeTransform {

  transform(value: any, format: string = 'short'): string {
    if (!value) {
      return 'N/A';
    }

    let date: Date;

    // Gérer les différents formats de date possibles
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      // Essayer de parser comme ISO string
      if (value.includes('T') || value.includes('-')) {
        date = new Date(value);
      } else {
        // Traiter comme timestamp (secondes ou millisecondes)
        const timestamp = parseInt(value, 10);
        // Si c'est un timestamp en secondes (valeur petite), convertir en millisecondes
        date = new Date(timestamp < 1e10 ? timestamp * 1000 : timestamp);
      }
    } else if (typeof value === 'number') {
      // Timestamp numérique
      const timestamp = value;
      // Si c'est un timestamp en secondes (valeur petite), convertir en millisecondes
      date = new Date(timestamp < 1e10 ? timestamp * 1000 : timestamp);
    } else {
      return 'Format invalide';
    }

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    // Formater selon le format demandé
    try {
      switch (format) {
        case 'short':
          return date.toLocaleDateString('fr-FR');
        case 'long':
          return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        case 'datetime':
          return date.toLocaleString('fr-FR');
        case 'iso':
          return date.toISOString().split('T')[0];
        default:
          return date.toLocaleDateString('fr-FR');
      }
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Erreur format';
    }
  }
}