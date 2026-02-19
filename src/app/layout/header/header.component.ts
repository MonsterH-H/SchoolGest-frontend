import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { SidebarService } from '../../core/services/sidebar.service'; // Import du service

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, UserMenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(private sidebarService: SidebarService) { } // Injection du service

  /**
   * Bascule l'état d'ouverture/fermeture de la barre latérale.
   * Utilisé principalement pour le bouton de menu hamburger sur mobile.
   */
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}