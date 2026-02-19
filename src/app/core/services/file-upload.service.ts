import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Upload a file to the storage service
   * @param file The file to upload
   * @param dossier Target folder name (e.g. "avatars", "justificatifs")
   * @returns Observable with upload progress and response (contains the URL)
   */
  upload(file: File, dossier: string = 'general'): Observable<{ progress: number, url?: string, response?: any }> {
    const formData = new FormData();
    formData.append('file', file);
    
    let params = new HttpParams().set('dossier', dossier);

    return this.http.post(`${this.baseUrl}/${API_ENDPOINTS.STORAGE.UPLOAD}`, formData, {
      params,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return { progress };
          case HttpEventType.Response:
            const body = event.body as any;
            return { 
              progress: 100, 
              url: body?.url,
              response: body 
            };
          default:
            return { progress: 0 };
        }
      })
    );
  }

  /**
   * Helper to upload specifically for profile pictures
   */
  uploadAvatar(file: File): Observable<{ progress: number, url?: string }> {
    return this.upload(file, 'avatars').pipe(
      map(res => ({ progress: res.progress, url: res.url }))
    );
  }

  /**
   * Helper to upload justificatifs
   */
  uploadJustificatif(file: File): Observable<{ progress: number, url?: string }> {
    return this.upload(file, 'justificatifs').pipe(
      map(res => ({ progress: res.progress, url: res.url }))
    );
  }

  /**
   * Validate file before upload
   * @param file The file to validate
   * @param allowedTypes Array of allowed MIME types
   * @param maxSizeMB Maximum size in Megabytes
   */
  validateFile(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf'], maxSizeMB: number = 5): { valid: boolean, error?: string } {
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `Type de fichier non supporté (${file.type}). Types autorisés: ${allowedTypes.join(', ')}` };
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      return { valid: false, error: `Le fichier est trop volumineux (${sizeInMB.toFixed(2)} MB). Taille max: ${maxSizeMB} MB` };
    }

    return { valid: true };
  }
}
