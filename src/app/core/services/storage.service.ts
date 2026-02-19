import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    /**
     * Upload un fichier sur Cloudinary via le backend
     * @param file Le fichier à uploader
     * @param folder Dossier de destination (optionnel)
     * @returns Observable contenant l'URL du fichier uploadé
     */
    upload(file: File, folder: string = 'general'): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<{ url: string }>(
            `${this.baseUrl}/${API_ENDPOINTS.STORAGE.UPLOAD}`,
            formData,
            { params: { dossier: folder } }
        );
    }
}
