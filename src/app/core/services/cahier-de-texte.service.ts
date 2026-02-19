import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { SeanceCreateDTO, SeanceResponseDTO } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class CahierDeTexteService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getByClasse(classeId: number): Observable<SeanceResponseDTO[]> {
    return this.http.get<SeanceResponseDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.CAHIER_TEXTE.BY_CLASSE(classeId)}`);
  }

  getByClasseAndDate(classeId: number, date: string): Observable<SeanceResponseDTO[]> {
    return this.http.get<SeanceResponseDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.CAHIER_TEXTE.BY_CLASSE_AND_DATE(classeId, date)}`);
  }

  createSeance(seance: SeanceCreateDTO): Observable<SeanceResponseDTO> {
    return this.http.post<SeanceResponseDTO>(`${this.baseUrl}/${API_ENDPOINTS.CAHIER_TEXTE.SEANCES}`, seance);
  }

  updateSeance(id: number, seance: SeanceCreateDTO, teacherId: number): Observable<SeanceResponseDTO> {
    const params = new HttpParams().set('teacherId', teacherId.toString());
    return this.http.put<SeanceResponseDTO>(`${this.baseUrl}/${API_ENDPOINTS.CAHIER_TEXTE.SEANCES_BY_ID(id)}`, seance, { params });
  }

  getByTeacher(teacherId: number): Observable<SeanceResponseDTO[]> {
    return this.http.get<SeanceResponseDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.CAHIER_TEXTE.BY_TEACHER(teacherId)}`);
  }

  archiverCahier(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${API_ENDPOINTS.CAHIER_TEXTE.ARCHIVER(id)}`, {});
  }
}
