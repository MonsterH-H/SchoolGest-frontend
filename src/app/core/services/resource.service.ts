import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { Resource } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.baseUrl}/${API_ENDPOINTS.RESOURCES.BASE}`);
  }

  createResource(resource: Partial<Resource>, file?: File): Observable<Resource> {
    const formData = new FormData();
    formData.append('resource', JSON.stringify(resource));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<Resource>(`${this.baseUrl}/${API_ENDPOINTS.RESOURCES.BASE}`, formData);
  }

  getBySubject(subjectId: number): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.baseUrl}/${API_ENDPOINTS.RESOURCES.BY_SUBJECT(subjectId)}`);
  }

  getByClasse(classeId: number, studentId: number): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.baseUrl}/${API_ENDPOINTS.RESOURCES.BY_CLASSE(classeId)}`, {
      params: { studentId: studentId.toString() }
    });
  }

  deleteResource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${API_ENDPOINTS.RESOURCES.DELETE(id)}`);
  }
}
