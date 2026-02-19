import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

/**
 * Composant de spinner de chargement réutilisable.
 * Affiche un indicateur de progression circulaire avec des options de personnalisation.
 * Peut être utilisé seul ou encapsulé dans une carte Material Design.
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  /**
   * Message optionnel à afficher sous le spinner.
   * @default ''
   */
  @Input() message: string = '';

  /**
   * Taille du spinner en pixels.
   * @default 50
   */
  @Input() size: number = 50;

  /**
   * Épaisseur du trait du spinner.
   * @default 4
   */
  @Input() strokeWidth: number = 4;

  /**
   * Couleur du spinner. Peut être 'primary', 'accent' ou 'warn' (couleurs du thème Material).
   * @default 'primary'
   */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  /**
   * Indique si le spinner doit être encapsulé dans une carte Material Design.
   * @default false
   */
  @Input() showCard: boolean = false;

  /**
   * Classes CSS supplémentaires à appliquer au conteneur du spinner.
   * @default ''
   */
  @Input() containerClass: string = '';
}