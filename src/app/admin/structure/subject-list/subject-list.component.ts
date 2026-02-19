import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../../core/services/academic.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ModuleDTO, Semester, SubjectDTO, Subject, TeacherDTO } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-subject-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './subject-list.component.html'
})
export class SubjectListComponent implements OnInit {
    private academicService = inject(AcademicService);
    private userService = inject(UserService);
    private notificationService = inject(NotificationService);

    subjects = signal<SubjectDTO[]>([]);
    modules = signal<ModuleDTO[]>([]);
    semesters = signal<Semester[]>([]);
    teachers = signal<TeacherDTO[]>([]);
    isLoading = signal<boolean>(false);
    showAddModal = signal<boolean>(false);
    showEditModal = signal<boolean>(false);

    newSubject: Partial<Subject> = {
        name: '',
        code: '',
        credits: 3,
        hoursCM: 20,
        hoursTD: 10,
        hoursTP: 5,
        coefficientCC: 0.4,
        coefficientExam: 0.6
    };

    editSubjectId = signal<number | null>(null);
    editSubject: Partial<SubjectDTO> = {};

    ngOnInit(): void {
        this.loadSubjects();
        this.loadModules();
        this.loadSemesters();
        this.loadTeachers();
    }

    loadSubjects(): void {
        this.isLoading.set(true);
        this.academicService.getSubjects()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.subjects.set(data),
                error: () => this.notificationService.showError('Erreur chargement des matières')
            });
    }

    loadModules(): void {
        this.academicService.getModules().subscribe({
            next: (data) => this.modules.set(data),
            error: () => this.notificationService.showError('Erreur chargement des modules')
        });
    }

    loadSemesters(): void {
        this.academicService.getSemesters().subscribe({
            next: (data) => this.semesters.set(data),
            error: () => this.notificationService.showError('Erreur chargement des semestres')
        });
    }

    loadTeachers(): void {
        this.userService.getTeachers().subscribe({
            next: (data) => this.teachers.set(data),
            error: () => this.notificationService.showError('Erreur chargement des enseignants')
        });
    }

    onCreateSubject(): void {
        if (!this.newSubject.name || !this.newSubject.code) return;

        this.academicService.createSubject(this.newSubject as Subject).subscribe({
            next: (created) => {
                this.loadSubjects(); // Reload to get DTO with names
                this.notificationService.showSuccess(`Matière ${created.name} ajoutée`);
                this.showAddModal.set(false);
                this.resetForm();
            },
            error: () => this.notificationService.showError('Erreur création')
        });
    }

    onChangeModule(subject: SubjectDTO, moduleId: number | null): void {
        if (!subject.id) return;
        if (moduleId == null) {
            this.academicService.unassignSubjectFromModule(subject.id).subscribe({
                next: (updated) => {
                    this.subjects.update(prev => prev.map(s => s.id === updated.id ? updated : s));
                    this.notificationService.showSuccess('Module retiré');
                },
                error: () => this.notificationService.showError('Erreur retrait du module')
            });
            return;
        }

        this.academicService.assignSubjectToModule(subject.id, moduleId).subscribe({
            next: (updated) => {
                this.subjects.update(prev => prev.map(s => s.id === updated.id ? updated : s));
                this.notificationService.showSuccess('Module affecté');
            },
            error: () => this.notificationService.showError('Erreur affectation du module')
        });
    }

    onChangeTeacher(subject: SubjectDTO, teacherId: number | null): void {
        if (!subject.id) return;
        if (teacherId == null) return;

        this.academicService.updateSubject(subject.id, { teacherId }).subscribe({
            next: (updated) => {
                this.subjects.update(prev => prev.map(s => s.id === updated.id ? updated : s));
                this.notificationService.showSuccess('Enseignant affecté');
            },
            error: () => this.notificationService.showError('Erreur affectation enseignant')
        });
    }

    openEditModal(subject: SubjectDTO): void {
        this.editSubjectId.set(subject.id);
        this.editSubject = { ...subject };
        this.showEditModal.set(true);
    }

    onUpdateSubject(): void {
        const id = this.editSubjectId();
        if (!id) return;
        if (!this.editSubject.name || !this.editSubject.code) return;

        const payload: Partial<SubjectDTO> = {
            code: this.editSubject.code,
            name: this.editSubject.name,
            hoursCM: this.editSubject.hoursCM,
            hoursTD: this.editSubject.hoursTD,
            hoursTP: this.editSubject.hoursTP,
            credits: this.editSubject.credits,
            coefficientCC: this.editSubject.coefficientCC,
            coefficientExam: this.editSubject.coefficientExam,
            semesterId: this.editSubject.semesterId,
            teacherId: this.editSubject.teacherId
        };

        this.academicService.updateSubject(id, payload).subscribe({
            next: () => {
                this.notificationService.showSuccess('Matière mise à jour');
                this.showEditModal.set(false);
                this.editSubjectId.set(null);
                this.editSubject = {};
                this.loadSubjects();
            },
            error: () => this.notificationService.showError('Erreur mise à jour')
        });
    }

    deleteSubject(id: number): void {
        if (confirm('Supprimer cette matière ?')) {
            this.academicService.deleteSubject(id).subscribe({
                next: () => {
                    this.subjects.update(prev => prev.filter(s => s.id !== id));
                    this.notificationService.showSuccess('Matière supprimée');
                },
                error: () => this.notificationService.showError('Erreur suppression')
            });
        }
    }

    private resetForm() {
        this.newSubject = {
            name: '',
            code: '',
            credits: 3,
            hoursCM: 20,
            hoursTD: 10,
            hoursTP: 5,
            coefficientCC: 0.4,
            coefficientExam: 0.6
        };
    }
}
