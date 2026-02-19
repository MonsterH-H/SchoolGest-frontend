import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../../core/services/academic.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SubjectDTO, EvaluationType, ClasseDTO } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-evaluation-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './evaluation-admin.component.html'
})
export class EvaluationAdminComponent implements OnInit {
    private academicService = inject(AcademicService);
    private evaluationService = inject(EvaluationService);
    private notificationService = inject(NotificationService);

    classes = signal<ClasseDTO[]>([]);
    subjects = signal<SubjectDTO[]>([]);
    selectedSubject = signal<SubjectDTO | null>(null);
    selectedClasseId = signal<number | null>(null);
    stats = signal<any>(null);
    isLoading = signal<boolean>(false);
    evaluationTypes = Object.values(EvaluationType);

    ngOnInit(): void {
        this.loadClasses();
        this.loadSubjects();
    }

    loadClasses(): void {
        this.academicService.getClasses().subscribe({
            next: (data) => this.classes.set(data)
        });
    }

    loadSubjects(classeId?: number): void {
        this.isLoading.set(true);
        const request$ = classeId
            ? this.academicService.getSubjectsByClasse(classeId)
            : this.academicService.getSubjects();

        request$
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.subjects.set(data),
                error: () => this.notificationService.showError('Erreur chargement matières')
            });
    }

    onClasseChange(classeId: number | null): void {
        this.selectedClasseId.set(classeId);
        this.selectedSubject.set(null);
        this.loadSubjects(classeId || undefined);
    }

    selectSubject(subject: SubjectDTO): void {
        this.selectedSubject.set(subject);
        this.loadStats(subject.id);
    }

    loadStats(subjectId: number): void {
        this.isLoading.set(true);
        this.evaluationService.getSubjectStats(subjectId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.stats.set(data),
                error: () => this.notificationService.showError('Erreur chargement statistiques')
            });
    }

    validateGrades(): void {
        const subject = this.selectedSubject();
        if (!subject) return;
        this.isLoading.set(true);
        this.evaluationService.validateGrades(subject.id)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess('Notes validées avec succès');
                    this.loadStats(subject.id);
                },
                error: () => this.notificationService.showError('Erreur lors de la validation')
            });
    }

    publishGrades(type: EvaluationType): void {
        const subject = this.selectedSubject();
        if (!subject) return;
        this.isLoading.set(true);
        this.evaluationService.publishGrades(subject.id, type)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess(`Notes (${type}) publiées aux étudiants`);
                    this.loadStats(subject.id);
                },
                error: () => this.notificationService.showError('Erreur lors de la publication')
            });
    }
}
