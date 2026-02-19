import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Admin Specific Sidebar Configuration -->
      <app-sidebar [role]="'ADMIN'"></app-sidebar>
      
      <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <app-header title="Administration"></app-header>
        
        <main class="w-full h-full flex-grow p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {}
