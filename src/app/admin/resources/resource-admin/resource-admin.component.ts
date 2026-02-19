import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../../core/services/academic.service';
import { StorageService } from '../../../core/services/storage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ModuleDTO, SubjectDTO, ResourceDTO, ClasseDTO } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/config/api-endpoints';

@Component({
    selector: 'app-resource-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './resource-admin.component.html'
})
export class ResourceAdminComponent implements OnInit {
    private academicService = inject(AcademicService);
    private storageService = inject(StorageService);
    private notificationService = inject(NotificationService);
    private http = inject(HttpClient);

    modules = signal<ModuleDTO[]>([]);
    subjects = signal<SubjectDTO[]>([]);
    filteredSubjects = signal<SubjectDTO[]>([]);
    classes = signal<ClasseDTO[]>([]);
    resources = signal<ResourceDTO[]>([]);
    isLoading = signal<boolean>(false);
    showUploadModal = signal<boolean>(false);
    selectedModuleId = signal<number | null>(null);

    // New Resource Form
    newResource = {
        title: '',
        description: '',
        type: 'DOC',
        subjectId: null as number | null,
        classeId: null as number | null,
        file: null as File | null
    };

    ngOnInit(): void {
        this.loadClasses();
        this.loadAllResources();
    }

    openUploadModal(): void {
        this.newResource = {
            title: '',
            description: '',
            type: 'DOC',
            subjectId: null as number | null,
            classeId: null as number | null,
            file: null as File | null
        };
        this.selectedModuleId.set(null);
        this.modules.set([]);
        this.filteredSubjects.set([]);
        this.showUploadModal.set(true);
    }

    loadSubjects(): void {
        this.academicService.getSubjects().subscribe(data => {
            this.subjects.set(data);
            this.filteredSubjects.set(data);
        });
    }

    loadClasses(): void {
        this.academicService.getClasses().subscribe(data => this.classes.set(data));
    }

    onClasseChange(): void {
        const classeId = this.newResource.classeId;
        this.selectedModuleId.set(null);
        this.newResource.subjectId = null;
        this.modules.set([]);

        if (!classeId) {
            this.filteredSubjects.set(this.subjects());
            return;
        }

        this.academicService.getModulesByClasse(classeId).subscribe({
            next: (data) => this.modules.set(data),
            error: () => this.notificationService.showError('Erreur chargement des modules')
        });

        this.academicService.getSubjectsByClasse(classeId).subscribe({
            next: (data) => this.filteredSubjects.set(data),
            error: () => this.notificationService.showError('Erreur chargement des matières')
        });
    }

    onModuleChange(): void {
        const moduleId = this.selectedModuleId();
        const classeId = this.newResource.classeId;
        this.newResource.subjectId = null;

        if (!moduleId) {
            if (classeId) {
                this.academicService.getSubjectsByClasse(classeId).subscribe({
                    next: (data) => this.filteredSubjects.set(data),
                    error: () => this.notificationService.showError('Erreur chargement des matières')
                });
                return;
            }
            this.filteredSubjects.set(this.subjects());
            return;
        }

        this.academicService.getSubjectsByModule(moduleId).subscribe({
            next: (data) => this.filteredSubjects.set(data),
            error: () => this.notificationService.showError('Erreur chargement des matières')
        });
    }

    loadAllResources(): void {
        this.isLoading.set(true);
        // Fetching for the first subject as a sample, or we could have a global endpoint
        this.http.get<ResourceDTO[]>(`${environment.apiUrl}/${API_ENDPOINTS.RESOURCES.BASE}`)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.resources.set(data),
                error: () => this.notificationService.showError('Erreur chargement ressources')
            });
    }

    onFileChange(event: any): void {
        this.newResource.file = event.target.files[0];
    }

    createResource(): void {
        if (!this.newResource.file || !this.newResource.subjectId || !this.newResource.classeId) return;

        this.isLoading.set(true);
        const formData = new FormData();
        const resourceData = {
            title: this.newResource.title,
            description: this.newResource.description,
            type: this.newResource.type,
            subjectId: this.newResource.subjectId,
            classeId: this.newResource.classeId,
            published: true
        };

        formData.append('resource', JSON.stringify(resourceData));
        formData.append('file', this.newResource.file);

        this.http.post<ResourceDTO>(`${environment.apiUrl}/${API_ENDPOINTS.RESOURCES.BASE}`, formData)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess('Ressource ajoutée avec succès');
                    this.showUploadModal.set(false);
                    this.loadAllResources();
                },
                error: () => this.notificationService.showError('Erreur lors de l\'ajout')
            });
    }

    deleteResource(id: number): void {
        if (confirm('Supprimer cette ressource ?')) {
            this.http.delete(`${environment.apiUrl}/${API_ENDPOINTS.RESOURCES.DELETE(id)}`).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Ressource supprimée');
                    this.loadAllResources();
                },
                error: () => this.notificationService.showError('Erreur suppression')
            });
        }
    }
}
