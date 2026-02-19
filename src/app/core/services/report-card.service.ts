import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { ReportCard } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class ReportCardService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  generateReportCard(studentId: number, semesterId: number, academicYear: string): Observable<ReportCard> {
    return this.http.post<ReportCard>(`${this.baseUrl}/${API_ENDPOINTS.REPORT_CARDS.GENERATE}`, {
      studentId,
      semesterId,
      academicYear
    });
  }

  calculateRanks(semesterId: number, academicYear: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${API_ENDPOINTS.REPORT_CARDS.CALCULATE_RANKS}`, {
      semesterId,
      academicYear
    });
  }

  getByStudent(studentId: number): Observable<ReportCard[]> {
    return this.http.get<ReportCard[]>(`${this.baseUrl}/${API_ENDPOINTS.REPORT_CARDS.BY_STUDENT(studentId)}`);
  }

  downloadPdf(reportCardId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${API_ENDPOINTS.REPORT_CARDS.PDF(reportCardId)}`, {
      responseType: 'blob'
    });
  }
}
