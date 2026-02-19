import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../core/services/academic.service';
import { CahierTexteService } from '../../core/services/cahier-texte.service';
import { NotificationService } from '../../core/services/notification.service';
import { ClasseDTO, SeanceResponseDTO } from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-textbook-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './textbook-admin.component.html',
})
export class TextbookAdminComponent implements OnInit {
    private academicService = inject(AcademicService);
    private textbookService = inject(CahierTexteService);
    private notificationService = inject(NotificationService);

    public window = window;

    classes = signal<ClasseDTO[]>([]);
    selectedClasse = signal<ClasseDTO | null>(null);
    seances = signal<SeanceResponseDTO[]>([]);
    isLoading = signal<boolean>(false);

    ngOnInit(): void {
        this.loadClasses();
    }

    loadClasses(): void {
        this.isLoading.set(true);
        this.academicService.getClasses()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.classes.set(data),
                error: () => this.notificationService.showError('Erreur lors du chargement des classes')
            });
    }

    selectClasse(classe: ClasseDTO): void {
        this.selectedClasse.set(classe);
        this.loadSeances(classe.id);
    }

    loadSeances(classeId: number): void {
        this.isLoading.set(true);
        this.textbookService.getByClasse(classeId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.seances.set(data),
                error: () => this.notificationService.showError('Erreur lors du chargement des séances')
            });
    }

    archiveClassTextbook(classe: ClasseDTO): void {
        if (confirm(`Voulez-vous vraiment archiver le cahier de texte de la classe ${classe.name} ? Cette action est irréversible.`)) {
            this.isLoading.set(true);
            // Using class ID as textbook ID for simplicity as per common ERP patterns
            this.textbookService.archiveTextbook(classe.id)
                .pipe(finalize(() => this.isLoading.set(false)))
                .subscribe({
                    next: () => {
                        this.notificationService.showSuccess('Cahier de texte archivé avec succès');
                        this.loadSeances(classe.id);
                    },
                    error: () => this.notificationService.showError('Erreur lors de l\'archivage')
                });
        }
    }
}
