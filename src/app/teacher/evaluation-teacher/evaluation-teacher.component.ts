import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EvaluationService } from '../../core/services/evaluation.service';
import { AcademicService } from '../../core/services/academic.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ClasseDTO, SubjectDTO, EvaluationType, Grade, StudentDTO } from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-evaluation-teacher',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './evaluation-teacher.component.html'
})
export class EvaluationTeacherComponent implements OnInit {
    private evaluationService = inject(EvaluationService);
    private academicService = inject(AcademicService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    classes = signal<ClasseDTO[]>([]);
    subjects = signal<SubjectDTO[]>([]);
    students = signal<StudentDTO[]>([]);

    selectedClasseId = signal<number | null>(null);
    selectedSubjectId = signal<number | null>(null);
    selectedStep = signal<number>(1);

    modules = signal<any[]>([]);
    selectedModuleId = signal<number | null>(null);

    isLoading = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    searchTerm = signal<string>('');

    evaluationForm: FormGroup;
    gradesMap = new Map<number, { score: number, feedback: string }>();

    filteredStudents = () => {
        const term = this.searchTerm().toLowerCase();
        return this.students().filter(s =>
            s.name.toLowerCase().includes(term) ||
            (s.studentNumber && s.studentNumber.toLowerCase().includes(term))
        );
    };

    constructor() {
        this.evaluationForm = this.fb.group({
            type: [EvaluationType.CONTROLE_CONTINU, Validators.required],
            date: [new Date().toISOString().split('T')[0], Validators.required],
            maxPoint: [20, [Validators.required, Validators.min(0)]],
            coefficient: [1, [Validators.required, Validators.min(0)]],
            academicYear: ['2025-2026', Validators.required]
        });
    }

    ngOnInit() {
        this.loadClasses();
    }

    loadClasses() {
        this.academicService.getClasses().subscribe({
            next: (data: ClasseDTO[]) => this.classes.set(data)
        });
    }

    onClasseChange(classeId: number) {
        this.selectedClasseId.set(classeId);
        this.selectedSubjectId.set(null);
        this.selectedModuleId.set(null);
        this.subjects.set([]);
        this.modules.set([]);

        if (classeId) {
            this.academicService.getModulesByClasse(classeId).subscribe({
                next: (data) => this.modules.set(data)
            });
            this.academicService.getSubjectsByClasse(classeId).subscribe({
                next: (data) => this.subjects.set(data)
            });
        }
    }

    onModuleChange(moduleId: number | null) {
        this.selectedModuleId.set(moduleId);
        this.selectedSubjectId.set(null);

        const classeId = this.selectedClasseId();
        if (!moduleId) {
            if (classeId) {
                this.academicService.getSubjectsByClasse(classeId).subscribe({
                    next: (data) => this.subjects.set(data)
                });
            }
            return;
        }

        this.academicService.getSubjectsByModule(moduleId).subscribe({
            next: (data) => this.subjects.set(data)
        });
    }

    startGrading() {
        if (!this.selectedClasseId() || !this.selectedSubjectId()) {
            this.notificationService.showError('Veuillez sélectionner une classe et une matière');
            return;
        }

        this.isLoading.set(true);
        this.academicService.getStudentsByClasse(this.selectedClasseId()!)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data: StudentDTO[]) => {
                    this.students.set(data);
                    this.gradesMap.clear();
                    data.forEach(s => {
                        if (s.id) this.gradesMap.set(s.id, { score: 0, feedback: '' });
                    });
                    this.selectedStep.set(2);
                },
                error: () => this.notificationService.showError('Erreur lors du chargement des étudiants')
            });
    }

    updateGrade(studentId: number, score: string) {
        const val = parseFloat(score);
        if (!isNaN(val)) {
            const current = this.gradesMap.get(studentId) || { score: 0, feedback: '' };
            this.gradesMap.set(studentId, { ...current, score: val });
        }
    }

    updateFeedback(studentId: number, feedback: string) {
        const current = this.gradesMap.get(studentId) || { score: 0, feedback: '' };
        this.gradesMap.set(studentId, { ...current, feedback });
    }

    fillDefaultGrades(score: number) {
        this.students().forEach(s => {
            if (s.id) {
                const current = this.gradesMap.get(s.id) || { score: 0, feedback: '' };
                this.gradesMap.set(s.id, { ...current, score });
            }
        });
    }

    submitGrades() {
        if (this.evaluationForm.invalid) return;

        const user = this.authService.getCurrentUser();
        const teacherId = user?.academicDetails?.id;

        const grades: Array<Partial<Grade>> = this.students().map(s => ({
            studentId: s.id!,
            subjectId: this.selectedSubjectId()!,
            teacherId: teacherId,
            score: this.gradesMap.get(s.id!)?.score || 0,
            feedback: this.gradesMap.get(s.id!)?.feedback || '',
            evaluationType: this.evaluationForm.value.type,
            date: this.evaluationForm.value.date,
            weight: this.evaluationForm.value.coefficient,
            maxScore: this.evaluationForm.value.maxPoint,
            academicYear: this.evaluationForm.value.academicYear
        }));

        this.evaluationService.submitGradesBatch(grades)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess('Notes enregistrées avec succès');
                    this.selectedStep.set(1);
                    this.gradesMap.clear();
                },
                error: () => this.notificationService.showError('Erreur lors de l\'enregistrement des notes')
            });
    }

    publishGrades() {
        if (!this.selectedSubjectId()) return;

        this.evaluationService.publishGrades(this.selectedSubjectId()!, this.evaluationForm.value.type)
            .subscribe({
                next: () => this.notificationService.showSuccess('Notes publiées pour les étudiants'),
                error: () => this.notificationService.showError('Erreur lors de la publication')
            });
    }
}
