import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourceService } from '../../core/services/resource.service';
import { AcademicService } from '../../core/services/academic.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ResourceDTO, SubjectDTO, ClasseDTO } from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-resource-teacher',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './resource-teacher.component.html'
})
export class ResourceTeacherComponent implements OnInit {
    private resourceService = inject(ResourceService);
    private academicService = inject(AcademicService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    resources = signal<ResourceDTO[]>([]);
    classes = signal<ClasseDTO[]>([]);
    subjects = signal<SubjectDTO[]>([]);

    isLoading = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    showUploadModal = signal<boolean>(false);

    resourceForm: FormGroup;
    selectedFile: File | null = null;

    constructor() {
        this.resourceForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            type: ['PDF', Validators.required],
            subjectId: [null, Validators.required],
            classeId: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadClasses();
        this.loadSubjects();
        this.loadMyResources();
    }

    loadClasses() {
        this.academicService.getClasses().subscribe((data: ClasseDTO[]) => this.classes.set(data));
    }

    loadSubjects() {
        this.academicService.getSubjects().subscribe((data: SubjectDTO[]) => this.subjects.set(data));
    }

    loadMyResources() {
        this.isLoading.set(true);
        this.resourceService.getResources().pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data: ResourceDTO[]) => this.resources.set(data),
                error: () => this.notificationService.showError('Erreur lors du chargement des ressources')
            });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement | null;
        const file = input?.files?.[0] ?? null;
        this.selectedFile = file;
    }

    uploadResource() {
        if (this.resourceForm.invalid || !this.selectedFile) {
            this.notificationService.showError('Veuillez remplir tous les champs et sélectionner un fichier');
            return;
        }

        this.isSaving.set(true);
        const user = this.authService.getCurrentUser();
        const resourceData = {
            ...this.resourceForm.value,
            teacherId: user?.id,
            published: true
        };

        this.resourceService.createResource(resourceData, this.selectedFile)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess('Support de cours partagé avec succès');
                    this.showUploadModal.set(false);
                    this.loadMyResources();
                },
                error: () => this.notificationService.showError('Échec du partage de la ressource')
            });
    }

    deleteResource(id: number | undefined) {
        if (!id) return;
        if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
            this.resourceService.deleteResource(id).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Ressource supprimée');
                    this.loadMyResources();
                }
            });
        }
    }
}
