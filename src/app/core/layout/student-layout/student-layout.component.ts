import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
    selector: 'app-student-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
    template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Student Specific Sidebar/Navigation Configuration -->
      <!-- Could be replaced by a Bottom Nav for Mobile-First approach -->
      <app-sidebar [role]="'ETUDIANT'"></app-sidebar>
      
      <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <app-header title="Espace Étudiant"></app-header>
        
        <main class="w-full h-full flex-grow p-4 md:p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: []
})
export class StudentLayoutComponent { }
