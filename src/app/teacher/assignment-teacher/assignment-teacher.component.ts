import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { AcademicService } from '../../core/services/academic.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ClasseDTO, SubjectDTO, Submission, Assignment } from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-assignment-teacher',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './assignment-teacher.component.html'
})
export class AssignmentTeacherComponent implements OnInit {
    private taskService = inject(TaskService);
    private academicService = inject(AcademicService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    classes = signal<ClasseDTO[]>([]);
    subjects = signal<SubjectDTO[]>([]);
    assignments = signal<Assignment[]>([]);
    submissions = signal<Submission[]>([]);

    selectedAssignmentId = signal<number | null>(null);
    showCreateModal = signal<boolean>(false);
    showSubmissionsModal = signal<boolean>(false);

    isLoading = signal<boolean>(false);
    isSaving = signal<boolean>(false);

    assignmentForm: FormGroup;
    selectedFile: File | null = null;

    constructor() {
        this.assignmentForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            subjectId: [null, Validators.required],
            classeId: [null, Validators.required],
            dueDate: ['', Validators.required],
            maxPoints: [20, Validators.required]
        });
    }

    ngOnInit() {
        this.loadClasses();
        this.loadSubjects();
    }

    loadClasses() {
        this.academicService.getClasses().subscribe((data: ClasseDTO[]) => this.classes.set(data));
    }

    loadSubjects() {
        this.academicService.getSubjects().subscribe((data: SubjectDTO[]) => this.subjects.set(data));
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    createAssignment() {
        if (this.assignmentForm.invalid) return;

        this.isSaving.set(true);
        const user = this.authService.getCurrentUser();
        const formValue = this.assignmentForm.value;
        const assignmentData = {
            title: formValue.title,
            description: formValue.description,
            subjectId: formValue.subjectId,
            classeId: formValue.classeId,
            deadline: formValue.dueDate,
            maxNote: formValue.maxPoints,
            teacherId: user?.id
        };

        this.taskService.createAssignment(assignmentData, this.selectedFile || undefined)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
                next: (res: Assignment) => {
                    this.notificationService.showSuccess('Devoir publié avec succès');
                    this.showCreateModal.set(false);
                    this.assignments.update(prev => [res, ...prev]);
                },
                error: () => this.notificationService.showError('Échec de la publication du devoir')
            });
    }

    viewSubmissions(id: number | undefined) {
        if (!id) return;
        this.selectedAssignmentId.set(id);
        this.isLoading.set(true);
        this.taskService.getSubmissions(id)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data: Submission[]) => {
                    this.submissions.set(data);
                    this.showSubmissionsModal.set(true);
                },
                error: () => this.notificationService.showError('Erreur lors du chargement des soumissions')
            });
    }

    gradeSubmission(submissionId: number | undefined, grade: number, feedback: string) {
        if (!submissionId) return;
        this.taskService.gradeSubmission(submissionId, grade, feedback).subscribe({
            next: () => {
                this.notificationService.showSuccess('Note enregistrée');
                if (this.selectedAssignmentId()) {
                    this.viewSubmissions(this.selectedAssignmentId()!);
                }
            },
            error: () => this.notificationService.showError('Échec de la notation')
        });
    }
}
