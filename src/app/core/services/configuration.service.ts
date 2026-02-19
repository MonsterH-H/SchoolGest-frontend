import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfigurationItem } from '../../shared/models/admin-dashboard-interfaces';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/admin'; // Assuming /admin as base URL for admin APIs

  /**
   * Récupère toutes les configurations.
   */
  getConfigurations(): Observable<ConfigurationItem[]> {
    return this.http.get<ConfigurationItem[]>(`${this.apiUrl}/configurations`);
  }

  /**
   * Met à jour une configuration spécifique.
   */
  updateConfiguration(updatedConfig: ConfigurationItem): Observable<ConfigurationItem> {
    return this.http.put<ConfigurationItem>(`${this.apiUrl}/configurations/${updatedConfig.key}`, updatedConfig);
  }
}
