import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component'; // Importez UserMenuComponent
import { SidebarService } from '../../core/services/sidebar.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, UserMenuComponent], // Ajoutez UserMenuComponent ici
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {
  isSidebarOpen: boolean = false;
  isMobile: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private sidebarService: SidebarService) { }

  ngOnInit(): void {
    this.sidebarService.isSidebarOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isSidebarOpen = isOpen;
      });

    this.checkWindowSize();
    window.addEventListener('resize', this.checkWindowSize.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.checkWindowSize.bind(this));
  }

  private checkWindowSize(): void {
    this.isMobile = window.innerWidth < 768; // 768px est le breakpoint 'md' de Tailwind
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}