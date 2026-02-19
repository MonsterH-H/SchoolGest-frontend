import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss']
})
export class ThemeSwitcherComponent {
  theme = signal<'light' | 'dark'>('light');

  toggleTheme() {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
    document.body.classList.toggle('dark-theme', this.theme() === 'dark');
    localStorage.setItem('theme', this.theme());
  }

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.theme.set('dark');
      document.body.classList.add('dark-theme');
    }
  }
}
