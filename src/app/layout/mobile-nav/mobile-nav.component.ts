import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, filter, map } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { Role, User } from '../../shared/models/api-schemas';

interface MobileNavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles?: string[];
}

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss'
})
export class MobileNavComponent implements OnInit {
  links: { path: string; icon: string; label: string; badge?: string }[] = [];
  fabIcon = 'add';
  isConnected = false;

  onFabClick(): void {
    const role = this.authService.getUserRole();
    if (role === Role.ENSEIGNANT) {
      this.router.navigate(['/teacher/textbook']);
    } else if (role === Role.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/student/schedule']);
    }
  }
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$!: Observable<User | null>;
  isOnline = navigator.onLine;
// Remove duplicate links property since it's already defined above

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    
    // Écouter les changements de connectivité
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  getNavItemsForUser(user: User | null): MobileNavItem[] {
    if (!user) return [];
    switch (user.role) {
      case Role.ETUDIANT:
        return [
          { label: 'Accueil', icon: 'home', route: '/student/dashboard' },
          { label: 'Emploi du temps', icon: 'calendar_today', route: '/student/schedule' },
          { label: 'Notes', icon: 'grade', route: '/student/grades' },
          { label: 'Profil', icon: 'person', route: '/profile' }
        ];
      
      case Role.ENSEIGNANT:
        return [
          { label: 'Accueil', icon: 'home', route: '/teacher/dashboard' },
          { label: 'Cahier de texte', icon: 'book', route: '/teacher/textbook' },
          { label: 'Présences', icon: 'people', route: '/teacher/attendance' },
          { label: 'Profil', icon: 'person', route: '/profile' }
        ];
      
      case Role.ADMIN:
        return [
          { label: 'Accueil', icon: 'home', route: '/admin/dashboard' },
          { label: 'Utilisateurs', icon: 'people', route: '/admin/users' },
          { label: 'Établissements', icon: 'school', route: '/admin/structure/establishments' },
          { label: 'Monitoring', icon: 'monitor_heart', route: '/admin/monitoring' }
        ];
      
      default:
        return [];
    }
  }

  getMainActionIcon(role: Role | undefined): string {
    if (!role) return 'add';
    switch (role) {
      case Role.ETUDIANT: return 'calendar_today';
      case Role.ENSEIGNANT: return 'add_circle';
      case Role.ADMIN: return 'dashboard';
      default: return 'add';
    }
  }

  getMainActionLabel(role: Role | undefined): string {
    if (!role) return 'Action principale';
    switch (role) {
      case Role.ETUDIANT: return 'Mon planning';
      case Role.ENSEIGNANT: return 'Nouvelle séance';
      case Role.ADMIN: return 'Dashboard';
      default: return 'Action principale';
    }
  }

  onMainAction(user: User | null): void {
    if (!user) return;
    this.onFabClick();
  }
}
