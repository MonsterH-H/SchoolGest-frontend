import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$: Observable<boolean> = this._isDarkMode.asObservable();

  constructor() {
    // Initialiser le thème en fonction des préférences de l'utilisateur ou du système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this._isDarkMode.next(prefersDark.matches);
    this.applyTheme(prefersDark.matches);

    prefersDark.addEventListener('change', (mediaQuery) => {
      this._isDarkMode.next(mediaQuery.matches);
      this.applyTheme(mediaQuery.matches);
    });
  }

  toggleTheme(): void {
    const currentMode = this._isDarkMode.value;
    this._isDarkMode.next(!currentMode);
    this.applyTheme(!currentMode);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}