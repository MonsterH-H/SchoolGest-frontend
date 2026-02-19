import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { NotificationService } from './notification.service';

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: number;
  metadata?: Record<string, any>;
}

export interface ErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authorization' | 'server' | 'client' | 'unknown';
  retryable: boolean;
  statusCode?: number;
  originalError?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private notificationService: NotificationService) {}

  /**
   * Gestion centralisée des erreurs
   */
  handleError(error: any, context?: ErrorContext): Observable<never> {
    const errorDetails = this.parseError(error);
    const contextInfo = context ? ` [${context.operation}]` : '';

    // Log de l'erreur avec contexte
    console.error(`ErrorHandler${contextInfo}:`, {
      error: errorDetails,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Afficher la notification appropriée
    this.showErrorNotification(errorDetails);

    // Retourner l'erreur pour que le composant puisse la gérer
    return throwError(() => errorDetails);
  }

  /**
   * Gestion des erreurs HTTP
   */
  handleHttpError(error: HttpErrorResponse, context?: ErrorContext): Observable<never> {
    const errorDetails = this.parseHttpError(error);
    return this.handleError(errorDetails, context);
  }

  /**
   * Gestion des erreurs de validation
   */
  handleValidationError(error: any, context?: ErrorContext): Observable<never> {
    const errorDetails: ErrorDetails = {
      code: 'VALIDATION_ERROR',
      message: 'Erreur de validation des données',
      userMessage: this.extractValidationMessage(error),
      severity: 'medium',
      category: 'validation',
      retryable: false,
      originalError: error
    };

    return this.handleError(errorDetails, context);
  }

  /**
   * Gestion des erreurs d'autorisation
   */
  handleAuthError(error: any, context?: ErrorContext): Observable<never> {
    const errorDetails: ErrorDetails = {
      code: 'AUTH_ERROR',
      message: 'Erreur d\'autorisation',
      userMessage: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
      severity: 'high',
      category: 'authorization',
      retryable: false,
      originalError: error
    };

    return this.handleError(errorDetails, context);
  }

  /**
   * Gestion des erreurs réseau
   */
  handleNetworkError(error: any, context?: ErrorContext): Observable<never> {
    const errorDetails: ErrorDetails = {
      code: 'NETWORK_ERROR',
      message: 'Erreur de connexion réseau',
      userMessage: 'Problème de connexion. Vérifiez votre connexion internet et réessayez.',
      severity: 'medium',
      category: 'network',
      retryable: true,
      originalError: error
    };

    return this.handleError(errorDetails, context);
  }

  // ================== MÉTHODES PRIVÉES ==================

  private parseError(error: any): ErrorDetails {
    // Si c'est déjà un ErrorDetails, le retourner tel quel
    if (this.isErrorDetails(error)) {
      return error;
    }

    // Si c'est une HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      return this.parseHttpError(error);
    }

    // Erreur générique
    return {
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'Erreur inconnue',
      userMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      severity: 'medium',
      category: 'unknown',
      retryable: true,
      originalError: error
    };
  }

  private parseHttpError(error: HttpErrorResponse): ErrorDetails {
    const status = error.status;
    const errorResponse = error.error;

    let code = 'HTTP_ERROR';
    let message = error.message;
    let userMessage = 'Une erreur s\'est produite. Veuillez réessayer.';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let category: 'network' | 'validation' | 'authorization' | 'server' | 'client' | 'unknown' = 'server';
    let retryable = false;

    switch (status) {
      case 0:
        // Erreur réseau
        code = 'NETWORK_ERROR';
        message = 'Connexion perdue';
        userMessage = '❌ Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.';
        category = 'network';
        retryable = true;
        break;

      case 400:
        // Bad Request - Erreur de validation
        code = 'VALIDATION_ERROR';
        message = 'Données invalides';
        userMessage = this.extractBackendValidationMessage(errorResponse) || '⚠️ Données invalides. Vérifiez vos informations.';
        category = 'validation';
        break;

      case 401:
        // Unauthorized - Erreurs d'authentification spécifiques
        code = 'UNAUTHORIZED';
        message = 'Non autorisé';
        userMessage = this.extractAuthErrorMessage(errorResponse) || this.extractAuthErrorMessage(error.message) || '🔐 Erreur d\'authentification';
        severity = 'high';
        category = 'authorization';
        console.log('🔐 401 Error - Original errorResponse:', errorResponse);
        console.log('🔐 401 Error - Extracted message:', userMessage);
        break;

      case 403:
        // Forbidden
        code = 'FORBIDDEN';
        message = 'Accès refusé';
        userMessage = '🚫 Vous n\'avez pas les permissions nécessaires pour cette action.';
        severity = 'high';
        category = 'authorization';
        break;

      case 404:
        // Not Found
        code = 'NOT_FOUND';
        message = 'Ressource non trouvée';
        userMessage = '🔍 La ressource demandée n\'existe pas ou a été supprimée.';
        category = 'client';
        break;

      case 409:
        // Conflict - Erreurs métier spécifiques
        code = 'CONFLICT';
        message = 'Conflit de données';
        userMessage = this.extractConflictErrorMessage(errorResponse);
        category = 'validation';
        break;

      case 422:
        // Unprocessable Entity
        code = 'VALIDATION_ERROR';
        message = 'Données non traitables';
        userMessage = this.extractBackendValidationMessage(errorResponse) || '⚠️ Données incorrectes. Vérifiez le format.';
        category = 'validation';
        break;

      case 429:
        // Too Many Requests
        code = 'RATE_LIMIT';
        message = 'Trop de requêtes';
        userMessage = '⏱️ Trop de requêtes. Veuillez patienter 1 minute avant de réessayer.';
        category = 'client';
        retryable = true;
        break;

      case 500:
        // Internal Server Error
        code = 'SERVER_ERROR';
        message = 'Erreur serveur interne';
        userMessage = '🔧 Erreur serveur. Notre équipe technique a été notifiée. Réessayez dans quelques instants.';
        severity = 'high';
        category = 'server';
        break;

      case 502:
      case 503:
      case 504:
        // Server unavailable
        code = 'SERVER_UNAVAILABLE';
        message = 'Serveur indisponible';
        userMessage = '🚧 Service temporairement indisponible. Veuillez réessayer dans quelques minutes.';
        category = 'server';
        retryable = true;
        break;

      default:
        // Autres erreurs HTTP
        code = `HTTP_${status}`;
        message = `Erreur HTTP ${status}`;
        userMessage = `❌ Erreur ${status}. Si le problème persiste, contactez le support.`;
        if (status >= 500) {
          severity = 'high';
          category = 'server';
        }
        break;
    }

    return {
      code,
      message,
      userMessage,
      severity,
      category,
      retryable,
      statusCode: status,
      originalError: error
    };
  }

  private extractValidationMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.errors && Array.isArray(error.errors)) {
      return error.errors.map((e: any) => e.message || e).join(', ');
    }

    if (error?.fieldErrors && Array.isArray(error.fieldErrors)) {
      return error.fieldErrors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
    }

    // Essayer d'extraire des erreurs de formulaire Angular
    if (error?.error && typeof error.error === 'object') {
      const messages = [];
      for (const [field, fieldErrors] of Object.entries(error.error)) {
        if (Array.isArray(fieldErrors)) {
          messages.push(`${field}: ${fieldErrors.join(', ')}`);
        } else if (typeof fieldErrors === 'string') {
          messages.push(`${field}: ${fieldErrors}`);
        }
      }
      if (messages.length > 0) {
        return messages.join('; ');
      }
    }

    return 'Veuillez vérifier vos données et réessayer.';
  }

  /**
   * Extraction des messages d'erreur d'authentification spécifiques
   */
  private extractAuthErrorMessage(error: any): string {
    console.log('🔍 Extracting auth error message from:', error);

    // Cas 1: Erreur Spring Boot ResponseStatusException
    if (typeof error === 'string') {
      const cleanError = error.replace(/"/g, '').trim();
      console.log('📝 Cleaned error string:', cleanError);

      // Messages spécifiques du backend
      if (cleanError.includes('Email ou mot de passe incorrect')) {
        if (cleanError.includes('Tentatives restantes')) {
          const match = cleanError.match(/Tentatives restantes\s*:\s*(\d+)/);
          const remaining = match ? match[1] : '?';
          return `❌ Email ou mot de passe incorrect. Tentatives restantes: ${remaining}`;
        }
        return '❌ Email ou mot de passe incorrect.';
      }

      if (cleanError.includes('compte bloqué') || cleanError.includes('Compte bloqué')) {
        return '🔒 Compte bloqué. Contactez l\'administrateur pour le débloquer.';
      }

      if (cleanError.includes('expir') || cleanError.includes('expiré')) {
        return '⏰ Session expirée. Veuillez vous reconnecter.';
      }

      if (cleanError.includes('bloqué') || cleanError.includes('blocked')) {
        return '🔒 Compte bloqué. Contactez l\'administrateur pour le débloquer.';
      }

      if (cleanError.includes('invalid') || cleanError.includes('incorrect')) {
        return '❌ Email ou mot de passe incorrect.';
      }

      // Si c'est un message Spring Boot, l'utiliser tel quel
      if (cleanError.length > 0 && cleanError.length < 200) {
        return `🔐 ${cleanError}`;
      }

      return `🔐 Erreur d'authentification: ${cleanError}`;
    }

    // Cas 2: Objet d'erreur avec message
    if (error?.message) {
      const message = error.message;
      console.log('📝 Error message:', message);

      // Messages spécifiques du backend
      if (message.includes('Email ou mot de passe incorrect')) {
        if (message.includes('Tentatives restantes')) {
          const match = message.match(/Tentatives restantes\s*:\s*(\d+)/);
          const remaining = match ? match[1] : '?';
          return `❌ Email ou mot de passe incorrect. Tentatives restantes: ${remaining}`;
        }
        return '❌ Email ou mot de passe incorrect.';
      }

      if (message.includes('compte bloqué') || message.includes('Compte bloqué')) {
        return '🔒 Votre compte est bloqué. Contactez l\'administrateur.';
      }

      if (message.includes('expir') || message.includes('expiré')) {
        return '⏰ Votre session a expiré. Veuillez vous reconnecter.';
      }

      if (message.includes('bloqué') || message.includes('blocked')) {
        return '🔒 Votre compte est bloqué. Contactez l\'administrateur.';
      }

      if (message.includes('invalid') || message.includes('incorrect') || message.includes('wrong')) {
        return '❌ Identifiants incorrects. Vérifiez votre email et mot de passe.';
      }

      if (message.includes('not found') || message.includes('non trouvé')) {
        return '👤 Utilisateur non trouvé. Vérifiez votre email.';
      }

      if (message.includes('disabled') || message.includes('désactivé')) {
        return '🚫 Compte désactivé. Contactez l\'administrateur.';
      }

      // Utiliser le message original si c'est court et informatif
      if (message.length > 0 && message.length < 150) {
        return `🔐 ${message}`;
      }

      return `🔐 Erreur d'authentification`;
    }

    // Cas 3: Erreur dans error.error (structure HTTP)
    if (error?.error?.message) {
      const innerMessage = error.error.message;
      console.log('📝 Inner error message:', innerMessage);

      if (innerMessage.includes('Email ou mot de passe incorrect')) {
        if (innerMessage.includes('Tentatives restantes')) {
          const match = innerMessage.match(/Tentatives restantes\s*:\s*(\d+)/);
          const remaining = match ? match[1] : '?';
          return `❌ Email ou mot de passe incorrect. Tentatives restantes: ${remaining}`;
        }
        return '❌ Email ou mot de passe incorrect.';
      }

      return `🔐 ${innerMessage}`;
    }

    // Cas 4: Erreur générique
    console.log('📝 No specific auth error pattern found, using generic message');
    return '🔐 Erreur d\'authentification. Vérifiez vos identifiants.';
  }

  /**
   * Extraction des messages d'erreur de conflit métier
   */
  private extractConflictErrorMessage(error: any): string {
    if (typeof error === 'string') {
      const lowerError = error.toLowerCase();
      if (lowerError.includes('inscription') && lowerError.includes('active')) {
        return ' Cet étudiant est déjà inscrit à cette classe ou ce module.';
      }
      if (lowerError.includes('email') && lowerError.includes('exist')) {
        return 'Cette adresse email est déjà utilisée.';
      }
      if (lowerError.includes('matricule') && lowerError.includes('exist')) {
        return ' Ce matricule est déjà enregistré.';
      }
      return ` Conflit: ${error}`;
    }

    if (error?.message) {
      const message = error.message.toLowerCase();
      if (message.includes('inscription') && message.includes('active')) {
        return '📚 Impossible: Une inscription active existe déjà pour cet étudiant.';
      }
      if (message.includes('email') && (message.includes('exist') || message.includes('déjà'))) {
        return '📧 Cette adresse email est déjà utilisée par un autre compte.';
      }
      if (message.includes('matricule') && (message.includes('exist') || message.includes('déjà'))) {
        return '🆔 Ce matricule est déjà enregistré dans le système.';
      }
      if (message.includes('duplicate') || message.includes('dupliqué')) {
        return '📋 Données dupliquées. Vérifiez vos informations.';
      }
      return `⚠️ ${error.message}`;
    }

    return '⚠️ Conflit de données détecté. Vérifiez vos informations.';
  }

  /**
   * Extraction des messages de validation du backend
   */
  private extractBackendValidationMessage(error: any): string {
    if (typeof error === 'string') {
      return `⚠️ ${error}`;
    }

    if (error?.message) {
      const message = error.message.toLowerCase();
      if (message.includes('required') || message.includes('requis')) {
        return '⚠️ Ce champ est obligatoire.';
      }
      if (message.includes('invalid') || message.includes('invalide')) {
        return '⚠️ Format invalide. Vérifiez vos données.';
      }
      if (message.includes('length') || message.includes('longueur')) {
        return '⚠️ Longueur invalide. Vérifiez la taille de vos données.';
      }
      if (message.includes('format') || message.includes('format')) {
        return '⚠️ Format incorrect. Suivez les instructions.';
      }
      return `⚠️ ${error.message}`;
    }

    if (error?.errors && Array.isArray(error.errors)) {
      const messages = error.errors.map((e: any) => {
        if (typeof e === 'string') return e;
        if (e?.message) return e.message;
        if (e?.field && e?.message) return `${e.field}: ${e.message}`;
        return 'Erreur de validation';
      });
      return `⚠️ ${messages.join(', ')}`;
    }

    if (error?.fieldErrors && Array.isArray(error.fieldErrors)) {
      const messages = error.fieldErrors.map((e: any) => `${e.field}: ${e.message || 'Erreur'}`);
      return `⚠️ ${messages.join(', ')}`;
    }

    return ''; // Retourner string vide si pas de message spécifique trouvé
  }

  private showErrorNotification(errorDetails: ErrorDetails): void {
    const message = errorDetails.userMessage;

    switch (errorDetails.severity) {
      case 'critical':
        this.notificationService.showError(message);
        break;
      case 'high':
        this.notificationService.showError(message);
        break;
      case 'medium':
        this.notificationService.showWarning(message);
        break;
      case 'low':
      default:
        this.notificationService.showInfo(message);
        break;
    }
  }

  private isErrorDetails(obj: any): obj is ErrorDetails {
    return obj &&
           typeof obj.code === 'string' &&
           typeof obj.message === 'string' &&
           typeof obj.userMessage === 'string' &&
           ['low', 'medium', 'high', 'critical'].includes(obj.severity) &&
           ['network', 'validation', 'authorization', 'server', 'client', 'unknown'].includes(obj.category) &&
           typeof obj.retryable === 'boolean';
  }

  // ================== MÉTHODES UTILITAIRES ==================

  /**
   * Crée un contexte d'erreur
   */
  createContext(operation: string, component?: string, metadata?: Record<string, any>): ErrorContext {
    return {
      operation,
      component,
      metadata
    };
  }

  /**
   * Vérifie si une erreur est retryable
   */
  isRetryable(error: any): boolean {
    const errorDetails = this.parseError(error);
    return errorDetails.retryable;
  }

  /**
   * Obtient le message utilisateur d'une erreur
   */
  getUserMessage(error: any): string {
    const errorDetails = this.parseError(error);
    return errorDetails.userMessage;
  }

  /**
   * Log une erreur sans la thrower
   */
  logError(error: any, context?: ErrorContext): void {
    const errorDetails = this.parseError(error);
    const contextInfo = context ? ` [${context.operation}]` : '';

    console.error(`ErrorLogger${contextInfo}:`, {
      error: errorDetails,
      context,
      timestamp: new Date().toISOString()
    });
  }
}