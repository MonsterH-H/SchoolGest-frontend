import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/services/attendance.service';
import { AcademicService } from '../../core/services/academic.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ClasseDTO, StudentDTO, AttendanceStatus } from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-attendance-teacher',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './attendance-teacher.component.html',
    styleUrl: './attendance-teacher.component.scss'
})
export class AttendanceTeacherComponent implements OnInit {
    private attendanceService = inject(AttendanceService);
    private academicService = inject(AcademicService);
    private scheduleService = inject(ScheduleService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthService);

    classes = signal<ClasseDTO[]>([]);
    students = signal<StudentDTO[]>([]);
    plannings = signal<any[]>([]);

    selectedClasseId = signal<number | null>(null);
    selectedPlanningId = signal<number | null>(null);

    isLoading = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    searchTerm = signal<string>('');
    selectedStudent = signal<StudentDTO | null>(null);
    studentHistory = signal<any[]>([]);
    studentStats = signal<any>(null);

    attendanceMap = new Map<number, { status: AttendanceStatus, notes: string }>();

    ngOnInit() {
        this.loadClasses();
        this.loadTodayPlannings();
    }

    filteredStudents() {
        const term = this.searchTerm().toLowerCase();
        return this.students().filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.studentNumber.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term)
        );
    }

    loadClasses() {
        this.academicService.getClasses().subscribe({
            next: (data: ClasseDTO[]) => this.classes.set(data),
            error: () => this.notificationService.showError('Erreur lors du chargement des classes')
        });
    }

    loadTodayPlannings() {
        const user = this.authService.getCurrentUser();
        const teacherId = user?.academicDetails?.id;
        if (teacherId) {
            const today = new Date().toISOString().split('T')[0];
            this.scheduleService.getParEnseignant(teacherId, today, today).subscribe({
                next: (data: any[]) => this.plannings.set(data)
            });
        }
    }

    onClasseChange(id: number) {
        this.selectedClasseId.set(id);
        this.loadStudents(id);
    }

    loadStudents(classeId: number) {
        this.isLoading.set(true);
        this.academicService.getStudentsByClasse(classeId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data: StudentDTO[]) => {
                    this.students.set(data);
                    this.attendanceMap.clear();
                    data.forEach(s => {
                        if (s.id) {
                            this.attendanceMap.set(s.id, { status: AttendanceStatus.PRESENT, notes: '' });
                        }
                    });
                },
                error: () => this.notificationService.showError('Erreur lors du chargement des étudiants')
            });
    }

    updateStatus(studentId: number, status: string) {
        const current = this.attendanceMap.get(studentId);
        if (current) {
            current.status = status as AttendanceStatus;
        }
    }

    updateNotes(studentId: number, notes: string) {
        const current = this.attendanceMap.get(studentId);
        if (current) {
            current.notes = notes;
        }
    }

    saveAttendance() {
        if (!this.selectedPlanningId()) {
            this.notificationService.showError('Veuillez sélectionner un créneau horaire (Planning)');
            return;
        }

        this.isSaving.set(true);
        const attendances = Array.from(this.attendanceMap.entries()).map(([studentId, data]) => ({
            studentId,
            status: data.status,
            notes: data.notes
        }));

        this.attendanceService.markAttendanceBatch({
            planningId: this.selectedPlanningId()!,
            attendances
        })
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess('Appel enregistré avec succès');
                },
                error: (err) => {
                    console.error('Mark Attendance Error:', err);
                    this.notificationService.showError('Échec de l\'enregistrement de l\'appel');
                }
            });
    }

    selectStudent(student: StudentDTO) {
        this.selectedStudent.set(student);
        this.loadStudentHistory(student.id);
        this.loadStudentStats(student.id);
    }

    loadStudentHistory(studentId: number) {
        this.attendanceService.getStudentHistory(studentId).subscribe({
            next: (data) => this.studentHistory.set(data),
            error: () => this.notificationService.showError('Erreur chargement historique')
        });
    }

    loadStudentStats(studentId: number) {
        this.attendanceService.getStudentStats(studentId).subscribe({
            next: (data) => this.studentStats.set(data),
            error: () => { }
        });
    }
}
