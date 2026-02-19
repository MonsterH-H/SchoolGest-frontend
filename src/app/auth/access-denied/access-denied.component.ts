import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../shared/models/api-schemas';

@Component({
    selector: 'app-access-denied',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10 text-center">
          <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-rose-100 mb-6">
            <svg class="h-12 w-12 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-2">Accès Refusé</h2>
          <p class="text-gray-600 mb-8">
            Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div class="space-y-4">
            <button (click)="goBack()" 
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
              Retour au Dashboard
            </button>
            <button (click)="logout()" 
              class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccessDeniedComponent {
    private router = inject(Router);
    private authService = inject(AuthService);

    goBack(): void {
        const role = this.authService.getUserRole();
        if (role === Role.ADMIN) this.router.navigate(['/admin/dashboard']);
        else if (role === Role.ENSEIGNANT) this.router.navigate(['/teacher/dashboard']);
        else if (role === Role.ETUDIANT) this.router.navigate(['/student/dashboard']);
        else this.router.navigate(['/login']);
    }

    logout(): void {
        this.authService.logout();
    }
}
