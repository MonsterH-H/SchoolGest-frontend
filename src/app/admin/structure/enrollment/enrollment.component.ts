import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../../core/services/academic.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserResponseDTO, ClasseDTO, Role } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-enrollment',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './enrollment.component.html'
})
export class EnrollmentComponent implements OnInit {
    private academicService = inject(AcademicService);
    private userService = inject(UserService);
    private notificationService = inject(NotificationService);

    students = signal<UserResponseDTO[]>([]);
    classes = signal<ClasseDTO[]>([]);
    isLoading = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);

    selectedStudentId = signal<number | null>(null);
    selectedClasseId = signal<number | null>(null);

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading.set(true);
        // Again, sequential for simplicity but real앱 would use forkJoin
        this.userService.searchUsers('', Role.ETUDIANT, true).subscribe(data => this.students.set(data));
        this.academicService.getClasses().subscribe(data => {
            this.classes.set(data);
            this.isLoading.set(false);
        });
    }

    onEnroll() {
        if (this.selectedStudentId() && this.selectedClasseId()) {
            this.isSubmitting.set(true);
            this.academicService.enrollStudent(this.selectedStudentId()!, this.selectedClasseId()!).pipe(
                finalize(() => this.isSubmitting.set(false))
            ).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Étudiant inscrit avec succès');
                    this.selectedStudentId.set(null);
                    this.selectedClasseId.set(null);
                },
                error: (err) => this.notificationService.showError('Échec de l\'inscription: ' + (err.error?.message || ''))
            });
        }
    }
}
