import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
    selector: 'app-teacher-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
    template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Teacher Specific Sidebar Configuration -->
      <app-sidebar [role]="'ENSEIGNANT'"></app-sidebar>
      
      <div class="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <app-header title="Espace Professeur"></app-header>
        
        <main class="w-full h-full flex-grow p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: []
})
export class TeacherLayoutComponent { }
