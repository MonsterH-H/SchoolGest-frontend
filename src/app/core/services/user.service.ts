import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { TeacherDTO, User, UserRole, UserResponseDTO } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  searchUsers(query?: string, role?: string, active?: boolean): Observable<UserResponseDTO[]> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    if (role) params = params.set('role', role);
    if (active !== undefined) params = params.set('active', active.toString());

    return this.http.get<UserResponseDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.USERS.BASE}`, { params });
  }

  getUsers(query?: string, role?: string, active?: boolean): Observable<UserResponseDTO[]> {
    return this.searchUsers(query, role, active);
  }

  getUserById(id: number | string): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.baseUrl}/${API_ENDPOINTS.USERS.BY_ID(id)}`);
  }

  createUser(user: User): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(`${this.baseUrl}/${API_ENDPOINTS.USERS.BASE}`, user);
  }

  updateUser(id: number | string, user: User): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${this.baseUrl}/${API_ENDPOINTS.USERS.BY_ID(id)}`, user);
  }

  deleteUser(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${API_ENDPOINTS.USERS.BY_ID(id)}`);
  }

  updateUserStatus(id: number | string, active: boolean): Observable<UserResponseDTO> {
    return this.http.patch<UserResponseDTO>(`${this.baseUrl}/${API_ENDPOINTS.USERS.STATUS(id)}`, { active });
  }

  updateStatus(id: number | string, active: boolean): Observable<UserResponseDTO> {
    return this.updateUserStatus(id, active);
  }

  updateRole(id: number | string, role: UserRole): Observable<UserResponseDTO> {
    return this.http.patch<UserResponseDTO>(`${this.baseUrl}/${API_ENDPOINTS.USERS.ROLE(id)}`, { role });
  }

  getTeachers(): Observable<TeacherDTO[]> {
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.USERS.TEACHERS}`);
  }
}
