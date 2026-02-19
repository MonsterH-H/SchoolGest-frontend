import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

// Variables pour gérer le rafraîchissement concurrent (Module Scope)
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  // Fonction utilitaire pour ajouter le token
  const addToken = (request: HttpRequest<any>, token: string) => {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  };

  let authReq = req;
  const token = authService.getToken();

  // Ne pas ajouter le token pour l'endpoint refresh pour éviter les boucles
  if (token && !req.url.includes('auth/refresh')) {
    authReq = addToken(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ignorer les erreurs non-401 ou si c'est déjà une requête de login/refresh
      if (
        error.status !== 401 ||
        req.url.includes('auth/login') ||
        req.url.includes('auth/refresh')
      ) {
        return handleError(error, authService, notificationService, router);
      }

      // Gestion du rafraîchissement pour erreur 401
      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const refreshToken = authService.getRefreshToken();

        if (refreshToken) {
          return authService.refreshToken(refreshToken).pipe(
            switchMap((response: any) => {
              isRefreshing = false;
              const newToken = response.accessToken;
              refreshTokenSubject.next(newToken);
              return next(addToken(req, newToken));
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout();
              notificationService.showNotification(
                'Session expirée. Veuillez vous reconnecter.',
                'error'
              );
              return throwError(() => err);
            })
          );
        } else {
          isRefreshing = false;
          authService.logout();
          return throwError(() => error);
        }
      } else {
        // Si un rafraîchissement est déjà en cours, attendre qu'il se termine
        return refreshTokenSubject.pipe(
          filter((token) => token != null),
          take(1),
          switchMap((token) => {
            return next(addToken(req, token!));
          })
        );
      }
    })
  );
};

function handleError(
  error: HttpErrorResponse,
  authService: any,
  notificationService: any,
  router: any
) {
  let errorMessage = 'Une erreur inattendue est survenue.';

  // Si la réponse est du HTML au lieu de JSON
  if (
    error.error &&
    typeof error.error === 'string' &&
    error.error.includes('<!doctype')
  ) {
    errorMessage =
      "Le serveur a retourné une page d'erreur HTML. Vérifiez que l'API est démarrée.";
    console.error('Réponse HTML inattendue:', error.error);
  } else if (error.error && typeof error.error === 'string') {
    // Réponse texte non-JSON (ex: "Configuration sauvegardée"), éviter l'erreur de parsing JSON
    errorMessage =
      'Réponse inattendue du serveur (texte brut). Vérifiez le format de la réponse API.';
    console.error('Réponse texte inattendue:', error.error);
  } else if (error.error instanceof ErrorEvent) {
    errorMessage = `Erreur: ${error.error.message}`;
  } else {
    switch (error.status) {
      case 401:
        // Si on arrive ici, c'est que ce n'était pas géré par le refresh (ex: login failed ou refresh failed propagé)
        errorMessage = 'Non autorisé. Veuillez vérifier vos identifiants.';
        // On ne logout pas ici car ça peut être une erreur de login
        break;
      case 403:
        errorMessage =
          "Accès refusé. Vous n'avez pas les permissions nécessaires.";
        router.navigate(['/access-denied']);
        break;
      case 404:
        errorMessage = 'Ressource non trouvée.';
        break;
      case 500:
        errorMessage =
          'Erreur interne du serveur. Veuillez réessayer plus tard.';
        break;
      case 0:
        errorMessage =
          "Impossible de contacter le serveur. Vérifiez votre connexion et que l'API est démarrée.";
        break;
      default:
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.statusText) {
          errorMessage = `Erreur ${error.status}: ${error.statusText}`;
        }
        break;
    }
  }

  // Afficher notification sauf si c'est une 401 sur login (géré par le composant)
  const isLoginRequest = router.url.includes('login') || router.url.includes('auth');
  if (error.status !== 401 || !isLoginRequest) {
    notificationService.showNotification(errorMessage, 'error');
  }

  // Préserver l'erreur HTTP originale (status, headers, etc.) pour les couches supérieures
  (error as any).__userMessage = errorMessage;
  return throwError(() => error);
}
