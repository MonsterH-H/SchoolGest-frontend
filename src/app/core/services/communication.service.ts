import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import { MessageDTO, NotificationDTO } from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  sendMessage(message: any, file?: File): Observable<MessageDTO> {
    const formData = new FormData();
    formData.append('message', JSON.stringify(message));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<MessageDTO>(`${this.baseUrl}/${API_ENDPOINTS.COMMUNICATIONS.MESSAGES}`, formData);
  }

  getInbox(userId: number): Observable<MessageDTO[]> {
    return this.http.get<MessageDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.COMMUNICATIONS.INBOX(userId)}`);
  }

  markAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${API_ENDPOINTS.COMMUNICATIONS.MARK_READ(messageId)}`, {});
  }

  getNotifications(userId: number): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.COMMUNICATIONS.NOTIFICATIONS(userId)}`);
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${API_ENDPOINTS.COMMUNICATIONS.UNREAD_COUNT(userId)}`);
  }
}
