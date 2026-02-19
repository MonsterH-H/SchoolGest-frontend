import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { PlanningDTO, Salle, SalleDTO, TimeSlot, TimeSlotDTO } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // --- Salles ---
  creerSalle(salle: Partial<Salle>): Observable<SalleDTO> {
    return this.http.post<SalleDTO>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.SALLES}`, salle);
  }

  listerSalles(): Observable<SalleDTO[]> {
    return this.http.get<SalleDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.SALLES}`);
  }

  // --- Créneaux ---
  creerCreneau(slot: Partial<TimeSlot>): Observable<TimeSlotDTO> {
    return this.http.post<TimeSlotDTO>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.CRENEAUX}`, slot);
  }

  listerCreneaux(): Observable<TimeSlotDTO[]> {
    return this.http.get<TimeSlotDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.CRENEAUX}`);
  }

  // --- Planification ---
  planifierCours(planning: Partial<PlanningDTO>): Observable<PlanningDTO> {
    return this.http.post<PlanningDTO>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.PLANNINGS}`, planning);
  }

  updatePlanning(id: number, planning: Partial<PlanningDTO>): Observable<PlanningDTO> {
    return this.http.put<PlanningDTO>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.PLANNINGS}/${id}`, planning);
  }

  deletePlanning(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.PLANNINGS}/${id}`);
  }

  // --- Consultation ---
  getParClasse(id: number, debut: string, fin: string): Observable<PlanningDTO[]> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http.get<PlanningDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.BY_CLASSE(id)}`, { params });
  }

  getParEnseignant(id: number, debut: string, fin: string): Observable<PlanningDTO[]> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http.get<PlanningDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.BY_TEACHER(id)}`, { params });
  }

  // --- Modifications ---
  annuler(id: number, motif: string): Observable<PlanningDTO> {
    return this.http.patch<PlanningDTO>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.ANNULER(id)}`, { motif });
  }

  reporter(id: number, date: string, timeSlotId: number): Observable<PlanningDTO> {
    return this.http.post<PlanningDTO>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.REPORTER(id)}`, { date, timeSlotId });
  }
}
