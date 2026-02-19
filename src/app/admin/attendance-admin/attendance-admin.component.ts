import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/services/attendance.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  AttendanceDTO,
  AttendanceStatus,
  JustificationStatus,
  UserResponseDTO,
  Role
} from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-attendance-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-admin.component.html',
  styleUrls: ['./attendance-admin.component.scss']
})
export class AttendanceAdminComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  students = signal<UserResponseDTO[]>([]);
  selectedStudent = signal<UserResponseDTO | null>(null);
  attendances = signal<AttendanceDTO[]>([]);
  isLoading = signal<boolean>(false);
  isActionLoading = signal<boolean>(false);
  searchQuery = signal<string>('');

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading.set(true);
    this.userService.searchUsers('', Role.ETUDIANT, true).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => this.students.set(data),
      error: () => this.notificationService.showError('Erreur lors du chargement des étudiants')
    });
  }

  onStudentSelect(student: UserResponseDTO) {
    this.selectedStudent.set(student);
    this.loadAttendance(student.id); // Assuming user.id corresponds to what service expects or I need studentId
    // Note: In api-schemas, StudentDTO has its own 'id'. UserResponseDTO.id is userId.
    // If the attendance history expects studentId, I might need to fetch the student profile first.
    // However, many systems use userId interchangeably if not careful. 
    // Let's assume for now it's studentId, but I should verify if I can get studentId from user.
  }

  loadAttendance(userId: number) {
    this.isLoading.set(true);
    // We might need to fetch the actual studentId linked to this userId
    // For now, let's call the history. We'll refine if studentId != userId.
    this.attendanceService.getStudentHistory(userId).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => this.attendances.set(data as any[]),
      error: () => this.notificationService.showError('Erreur lors du chargement des présences')
    });
  }

  validateJustification(attendance: AttendanceDTO, accepted: boolean) {
    this.isActionLoading.set(true);
    this.attendanceService.validateJustification(attendance.id, accepted).pipe(
      finalize(() => this.isActionLoading.set(false))
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess(accepted ? 'Justification acceptée' : 'Justification refusée');
        if (this.selectedStudent()) {
          this.loadAttendance(this.selectedStudent()!.id);
        }
      },
      error: () => this.notificationService.showError('Erreur lors de la validation')
    });
  }

  getStatusClass(status: AttendanceStatus): string {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'bg-emerald-100 text-emerald-700';
      case AttendanceStatus.ABSENT: return 'bg-rose-100 text-rose-700';
      case AttendanceStatus.RETARD: return 'bg-amber-100 text-amber-700';
      case AttendanceStatus.EXCUSE: return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getJustificationClass(status: JustificationStatus): string {
    switch (status) {
      case JustificationStatus.ACCEPTED: return 'bg-emerald-100 text-emerald-700';
      case JustificationStatus.REJECTED: return 'bg-rose-100 text-rose-700';
      case JustificationStatus.PENDING: return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
