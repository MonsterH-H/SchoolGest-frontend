import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getDashboardStats(teacherId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${API_ENDPOINTS.TEACHER_DASHBOARD.STATS(teacherId)}`);
  }

  getAssignmentsToGrade(teacherId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${API_ENDPOINTS.TEACHER_DASHBOARD.PENDING_ASSIGNMENTS(teacherId)}`);
  }
}



