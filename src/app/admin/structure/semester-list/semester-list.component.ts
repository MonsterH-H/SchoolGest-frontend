import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../../core/services/academic.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Semester } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-semester-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './semester-list.component.html'
})
export class SemesterListComponent implements OnInit {
    private academicService = inject(AcademicService);
    private notificationService = inject(NotificationService);

    semesters = signal<Semester[]>([]);
    isLoading = signal<boolean>(false);
    showAddModal = signal<boolean>(false);
    showEditModal = signal<boolean>(false);
    editSemesterId = signal<number | null>(null);

    newSemester: Partial<Semester> = {
        name: 'Semestre 1',
        academicYear: '2025-2026',
        active: true
    };

    editSemester: Partial<Semester> = {
        name: '',
        academicYear: '',
        active: false
    };

    ngOnInit(): void {
        this.loadSemesters();
    }

    loadSemesters(): void {
        this.isLoading.set(true);
        this.academicService.getSemesters()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.semesters.set(data),
                error: () => this.notificationService.showError('Erreur chargement des semestres')
            });
    }

    onCreateSemester(): void {
        this.academicService.createSemester(this.newSemester as Semester).subscribe({
            next: (created) => {
                this.semesters.update(prev => [...prev, created]);
                this.notificationService.showSuccess(`Semestre ${created.name} créé`);
                this.showAddModal.set(false);
            },
            error: () => this.notificationService.showError('Erreur création')
        });
    }

    openEdit(semester: Semester): void {
        this.editSemesterId.set(semester.id ?? null);
        this.editSemester = {
            name: semester.name,
            academicYear: semester.academicYear,
            startDate: semester.startDate,
            endDate: semester.endDate,
            active: semester.active
        };
        this.showEditModal.set(true);
    }

    closeEdit(): void {
        this.showEditModal.set(false);
        this.editSemesterId.set(null);
        this.editSemester = { name: '', academicYear: '', active: false };
    }

    onUpdateSemester(): void {
        const id = this.editSemesterId();
        if (!id) return;
        if (!this.editSemester.name || !this.editSemester.academicYear) return;

        this.academicService.updateSemester(id, this.editSemester).subscribe({
            next: () => {
                this.notificationService.showSuccess('Semestre mis à jour');
                this.closeEdit();
                this.loadSemesters();
            },
            error: () => this.notificationService.showError('Erreur mise à jour')
        });
    }

    deleteSemester(id: number | null | undefined): void {
        if (typeof id !== 'number') return;
        if (!confirm('Supprimer ce semestre ?')) return;
        this.academicService.deleteSemester(id).subscribe({
            next: () => {
                this.notificationService.showSuccess('Semestre supprimé');
                this.semesters.update(prev => prev.filter(s => s.id !== id));
            },
            error: () => this.notificationService.showError('Erreur suppression')
        });
    }
}
