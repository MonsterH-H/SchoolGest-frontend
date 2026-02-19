import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TimeSlot } from '@core/models/time-slot.model';
import { TimeSlotDTO } from '@core/models/time-slot.model.dto';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private readonly apiUrl = `${environment.apiUrl}/emploidutemps`;

  constructor(private http: HttpClient) { }

  getTimeSlots(): Observable<TimeSlotDTO[]> {
    return this.http.get<TimeSlotDTO[]>(`${this.apiUrl}/creneaux`);
  }

  createTimeSlot(timeSlot: TimeSlot): Observable<TimeSlotDTO> {
    return this.http.post<TimeSlotDTO>(`${this.apiUrl}/creneaux`, timeSlot);
  }

  updateTimeSlot(id: number, timeSlot: TimeSlot): Observable<TimeSlotDTO> {
    return this.http.put<TimeSlotDTO>(`${this.apiUrl}/creneaux/${id}`, timeSlot);
  }

  deleteTimeSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/creneaux/${id}`);
  }
}
