import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { DashboardStatsDTO } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Récupère les statistiques globales d'administration
   */
  getAdminStats(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(`${this.baseUrl}/${API_ENDPOINTS.ADMIN.DASHBOARD}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les statistiques de présence pour un étudiant
   */
  getStudentAttendanceStats(studentId: number): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.baseUrl}/${API_ENDPOINTS.ATTENDANCE.STUDENT_STATS(studentId)}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère la moyenne d'un étudiant pour une matière
   */
  getStudentAverageBySubject(studentId: number, subjectId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.STUDENT_AVERAGE(studentId)}`, {
      params: { subjectId: subjectId.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
