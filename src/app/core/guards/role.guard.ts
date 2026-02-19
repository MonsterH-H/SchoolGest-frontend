import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../shared/models/api-schemas';

/**
 * Garde de rôle fonctionnel pour Angular 21
 * Vérifie si l'utilisateur possède les droits nécessaires pour accéder à une route
 */
export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Vérifier d'abord l'authentification
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // 2. Récupérer les rôles autorisés définis dans la config de la route
  const requiredRoles = route.data['roles'] as Role[];
  const userRole = authService.getUserRole();

  // 3. Logique de validation
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // Aucune restriction de rôle
  }

  if (userRole && requiredRoles.includes(userRole)) {
    return true; // Rôle autorisé
  }

  // 4. Si non autorisé, rediriger vers la page "accès refusé"
  console.warn(`Accès refusé: Rôle ${userRole} n'a pas accès à ${state.url}`);
  return router.createUrlTree(['/access-denied']);
};