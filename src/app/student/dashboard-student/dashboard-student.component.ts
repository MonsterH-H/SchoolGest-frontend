import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { EvaluationService } from '../../core/services/evaluation.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { UserResponseDTO, PlanningDTO, Grade } from '../../shared/models/api-schemas';
import { finalize, forkJoin } from 'rxjs';

@Component({
    selector: 'app-dashboard-student',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard-student.component.html'
})
export class DashboardStudentComponent implements OnInit {
    private authService = inject(AuthService);
    private statsService = inject(StatisticsService);
    private evaluationService = inject(EvaluationService);
    private scheduleService = inject(ScheduleService);

    currentUser = signal<UserResponseDTO | null>(null);
    attendanceStats = signal<any>(null);
    recentGrades = signal<Grade[]>([]);
    todaySchedule = signal<PlanningDTO[]>([]);
    isLoading = signal<boolean>(true);

    ngOnInit(): void {
        this.isLoading.set(true);
        this.authService.getMe().subscribe({
            next: (user) => {
                this.currentUser.set(user);
                
                if (user && user.academicDetails && user.academicDetails.id) {
                    const studentId = user.academicDetails.id;
                    const classeId = user.academicDetails.classeId;
                    this.loadDashboardData(studentId, classeId);
                } else {
                    console.error('Student details missing for user:', user);
                    this.isLoading.set(false);
                }
            },
            error: (err) => {
                console.error('Failed to load user profile', err);
                this.isLoading.set(false);
            }
        });
    }

    loadDashboardData(studentId: number, classeId?: number): void {
        this.isLoading.set(true);
        const today = new Date().toISOString().split('T')[0];

        const requests: any = {
            attendance: this.statsService.getStudentAttendanceStats(studentId),
            grades: this.evaluationService.getStudentGrades(studentId)
        };

        if (classeId) {
            requests.schedule = this.scheduleService.getParClasse(classeId, today, today);
        }

        forkJoin(requests).pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (res: any) => {
                this.attendanceStats.set(res.attendance);
                const sortedGrades = (res.grades ?? []).slice().sort((a: Grade, b: Grade) => {
                    const aDate = a.createdAt ?? '';
                    const bDate = b.createdAt ?? '';
                    return bDate.localeCompare(aDate);
                });
                this.recentGrades.set(sortedGrades.slice(0, 5));
                if (res.schedule) {
                    this.todaySchedule.set(res.schedule);
                }
            },
            error: (err) => console.error('Student Dashboard Error:', err)
        });
    }
}
