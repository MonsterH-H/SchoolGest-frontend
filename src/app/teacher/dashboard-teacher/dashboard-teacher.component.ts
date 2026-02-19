import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { AdminService } from '../../core/services/admin.service';
import { TaskService } from '../../core/services/task.service';
import { TeacherService } from '../../core/services/dashboard.service';
import { UserResponseDTO, PlanningDTO, TeacherDashboardStatsDTO } from '../../shared/models/api-schemas';
import { finalize, forkJoin } from 'rxjs';

@Component({
    selector: 'app-dashboard-teacher',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard-teacher.component.html'
})
export class DashboardTeacherComponent implements OnInit {
    private authService = inject(AuthService);
    private scheduleService = inject(ScheduleService);
    private adminService = inject(AdminService);
    private taskService = inject(TaskService);
    private teacherService = inject(TeacherService);

    currentUser = signal<UserResponseDTO | null>(null);
    stats = signal<TeacherDashboardStatsDTO | null>(null);
    todaySchedule = signal<PlanningDTO[]>([]);
    isLoading = signal<boolean>(true);

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.currentUser.set(user);
            if (user.academicDetails?.id) {
                this.loadDashboardData(user.academicDetails.id);
            } else {
                // If details are missing, fetch them
                this.authService.getMe().subscribe(updatedUser => {
                    this.currentUser.set(updatedUser);
                    if (updatedUser.academicDetails?.id) {
                        this.loadDashboardData(updatedUser.academicDetails.id);
                    }
                });
            }
        }
    }


    loadDashboardData(userId: number): void {
        this.isLoading.set(true);
        const today = new Date().toISOString().split('T')[0];

        forkJoin({
            schedule: this.scheduleService.getParEnseignant(userId, today, today),
            teacherStats: this.teacherService.getDashboardStats(userId)
        }).pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (res) => {
                this.todaySchedule.set(res.schedule);
                this.stats.set(res.teacherStats);
            },
            error: (err) => console.error('Dashboard Error:', err)
        });
    }
}
