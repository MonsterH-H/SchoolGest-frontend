import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { DashboardStatsDTO, UserResponseDTO } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Récupère les statistiques globales pour le tableau de bord admin
   */
  getStats(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(`${this.baseUrl}/${API_ENDPOINTS.ADMIN.DASHBOARD}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère l'état de santé du système
   */
  getSystemStatus(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(`${this.baseUrl}/${API_ENDPOINTS.ADMIN.SYSTEM_STATUS}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Importation de masse des utilisateurs via fichier CSV/Excel
   */
  importUsers(file: File): Observable<any[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any[]>(`${this.baseUrl}/${API_ENDPOINTS.ADMIN.IMPORT_USERS}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Exportation des utilisateurs au format CSV
   */
  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${API_ENDPOINTS.ADMIN.EXPORT_USERS}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Suppression groupée d'utilisateurs
   */
  deleteUsersBatch(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${API_ENDPOINTS.USERS.BATCH_DELETE}`, { ids }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Mise à jour groupée du statut des utilisateurs
   */
  updateUsersStatusBatch(ids: number[], active: boolean): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${API_ENDPOINTS.USERS.BATCH_STATUS}`, { ids, active }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Génération globale des bulletins
   */
  generateReportCards(semesterId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${API_ENDPOINTS.REPORT_CARDS.GENERATE}`, { semesterId }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Calcul des rangs
   */
  calculateRanks(semesterId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${API_ENDPOINTS.REPORT_CARDS.CALCULATE_RANKS}`, { semesterId }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('AdminService Error:', error);
    return throwError(() => new Error(error.message || 'Erreur serveur admin'));
  }
}
