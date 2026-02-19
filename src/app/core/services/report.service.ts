import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Report } from '../../shared/models/admin-dashboard-interfaces';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/admin'; // Assuming /admin as base URL for admin APIs

  /**
   * Récupère la liste des rapports.
   */
  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/reports`);
  }

  /**
   * Génère un nouveau rapport.
   * @param type - Le type de rapport à générer.
   * @param startDate - La date de début de la période du rapport.
   * @param endDate - La date de fin de la période du rapport.
   */
  generateReport(type: string, startDate: Date, endDate: Date): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/reports/generate`, { type, startDate, endDate });
  }
}