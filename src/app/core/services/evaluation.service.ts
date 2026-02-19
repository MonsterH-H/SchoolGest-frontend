import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import {
  Grade,
  Exam,
  EvaluationType
} from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createExam(exam: Exam): Observable<Exam> {
    return this.http.post<Exam>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.EXAMS}`, exam);
  }

  submitGrade(grade: Partial<Grade>): Observable<Grade> {
    return this.http.post<Grade>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.GRADES}`, grade);
  }

  submitGradesBatch(grades: Array<Partial<Grade>>): Observable<Grade[]> {
    return this.http.post<Grade[]>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.GRADES_BATCH}`, grades);
  }

  publishGrades(subjectId: number, type: EvaluationType): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.PUBLISH}`, {}, {
      params: { subjectId: subjectId.toString(), type }
    });
  }

  validateGrades(subjectId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.VALIDATE}`, {}, {
      params: { subjectId: subjectId.toString() }
    });
  }

  getStudentAverage(studentId: number, subjectId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.STUDENT_AVERAGE(studentId)}`, {
      params: { subjectId: subjectId.toString() }
    });
  }

  getSubjectStats(subjectId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.SUBJECT_STATS(subjectId)}`);
  }

  getStudentGrades(studentId: number): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.baseUrl}/${API_ENDPOINTS.EVALUATIONS.STUDENT_GRADES(studentId)}`);
  }
}
