import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/api-schemas';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est connecté
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Vérifier si l'utilisateur a le rôle ADMIN
  if (!authService.hasRole(UserRole.ADMIN)) {
    router.navigate(['/']); // Rediriger vers la page d'accueil
    return false;
  }

  return true;
};
