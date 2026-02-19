import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import {
  Assignment,
  Submission
} from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createAssignment(assignment: Partial<Assignment>, file?: File): Observable<Assignment> {
    const formData = new FormData();
    formData.append('assignment', JSON.stringify(assignment));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<Assignment>(`${this.baseUrl}/${API_ENDPOINTS.TASKS.DEVOIRS}`, formData);
  }

  getSubmissions(assignmentId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/${API_ENDPOINTS.TASKS.SUBMISSIONS(assignmentId)}`);
  }

  gradeSubmission(submissionId: number, grade: number, feedback: string): Observable<Submission> {
    return this.http.patch<Submission>(`${this.baseUrl}/${API_ENDPOINTS.TASKS.GRADE_SUBMISSION(submissionId)}`, { grade, feedback });
  }

  uploadSolution(assignmentId: number, file: File): Observable<Assignment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.patch<Assignment>(`${this.baseUrl}/${API_ENDPOINTS.TASKS.SOLUTION(assignmentId)}`, formData);
  }

  submitWork(assignmentId: number, studentId: number, text?: string, file?: File): Observable<Submission> {
    const formData = new FormData();
    formData.append('studentId', studentId.toString());
    if (text) formData.append('text', text);
    if (file) formData.append('file', file);
    return this.http.post<Submission>(`${this.baseUrl}/${API_ENDPOINTS.TASKS.SUBMIT(assignmentId)}`, formData);
  }

  getStudentTasks(studentId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.baseUrl}/${API_ENDPOINTS.TASKS.STUDENT_TASKS(studentId)}`);
  }
}
