import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThemeService } from '@core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'

 
})
export class FooterComponent implements OnInit {
  private themeService = inject(ThemeService);

  isDarkMode$!: Observable<boolean>;
  currentYear: number = new Date().getFullYear();
  appVersion: string = '1.0.0';
  isOnline: boolean = navigator.onLine;

  ngOnInit(): void {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    
    // Écouter les changements de statut réseau
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}