import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Garde d'authentification fonctionnel pour Angular 21
 * Vérifie si l'utilisateur est connecté avant d'autoriser l'accès
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Rediriger vers login avec l'URL de retour
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};