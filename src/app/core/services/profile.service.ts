import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { Student, StudentDTO, Teacher, TeacherDTO } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Update teacher profile with optional CV file
   */
  updateTeacherProfile(data: Partial<Teacher>, cvFile?: File): Observable<TeacherDTO> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (cvFile) {
      formData.append('cv', cvFile);
    }

    return this.http.put<TeacherDTO>(`${this.baseUrl}/${API_ENDPOINTS.PROFILES.TEACHER}`, formData);
  }

  /**
   * Update student profile with optional photo
   */
  updateStudentProfile(data: Partial<Student>, photo?: File): Observable<StudentDTO> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.put<StudentDTO>(`${this.baseUrl}/${API_ENDPOINTS.PROFILES.STUDENT}`, formData);
  }
}
