import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import {
  Attendance,
  AttendanceStatus
} from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  markAttendance(request: { studentId: number, planningId: number, status: AttendanceStatus, notes?: string }): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.baseUrl}/${API_ENDPOINTS.ATTENDANCE.MARK}`, request);
  }

  markAttendanceBatch(request: { planningId: number, attendances: any[] }): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(`${this.baseUrl}/${API_ENDPOINTS.ATTENDANCE.MARK}/batch`, request);
  }

  justifyAbsence(id: number, reason: string, file?: File): Observable<Attendance> {
    const formData = new FormData();
    formData.append('reason', reason);
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<Attendance>(`${this.baseUrl}/${API_ENDPOINTS.ATTENDANCE.JUSTIFY(id)}`, formData);
  }

  validateJustification(id: number, accepted: boolean): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.baseUrl}/${API_ENDPOINTS.ATTENDANCE.VALIDATE_JUSTIFICATION(id)}`, {}, {
      params: { accepted: accepted.toString() }
    });
  }

  getStudentStats(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${API_ENDPOINTS.ATTENDANCE.STUDENT_STATS(studentId)}`);
  }

  getStudentHistory(studentId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseUrl}/${API_ENDPOINTS.ATTENDANCE.STUDENT_HISTORY(studentId)}`);
  }
}
