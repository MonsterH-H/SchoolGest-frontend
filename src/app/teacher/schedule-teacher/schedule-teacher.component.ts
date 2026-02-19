import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../../core/services/schedule.service';
import { AuthService } from '../../core/services/auth.service';
import { PlanningDTO } from '../../shared/models/api-schemas';
import { NotificationService } from '../../core/services/notification.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-schedule-teacher',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './schedule-teacher.component.html',
    styleUrl: './schedule-teacher.component.scss'
})
export class ScheduleTeacherComponent implements OnInit {
    private scheduleService = inject(ScheduleService);
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);

    schedule = signal<PlanningDTO[]>([]);
    isLoading = signal<boolean>(false);
    currentDate = signal<Date>(new Date());
    weekDays = signal<Date[]>([]);
    teacherId: number | null = null;

    ngOnInit(): void {
        this.generateWeekDays();
        const user = this.authService.getCurrentUser();
        this.teacherId = user?.academicDetails?.id ?? null;

        if (this.teacherId) {
            this.loadSchedule();
        } else {
            this.notificationService.showError('Profil enseignant introuvable');
        }
    }

    generateWeekDays(): void {
        const start = this.getStartOfWeek(this.currentDate());
        const days = [];
        for (let i = 0; i < 6; i++) { // Lundi à Samedi
            days.push(this.addDays(start, i));
        }
        this.weekDays.set(days);
    }

    loadSchedule(): void {
        if (!this.teacherId) return;

        this.isLoading.set(true);
        const start = this.getStartOfWeek(this.currentDate());
        const end = this.addDays(start, 5); // Jusqu'au samedi
        const startStr = this.formatLocalDate(start);
        const endStr = this.formatLocalDate(end);

        this.scheduleService.getParEnseignant(this.teacherId, startStr, endStr)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.schedule.set(data),
                error: (err) => {
                    console.error('Error loading schedule', err);
                    this.notificationService.showError('Impossible de charger l\'emploi du temps');
                }
            });
    }

    previousWeek(): void {
        this.currentDate.set(this.addDays(this.currentDate(), -7));
        this.generateWeekDays();
        this.loadSchedule();
    }

    nextWeek(): void {
        this.currentDate.set(this.addDays(this.currentDate(), 7));
        this.generateWeekDays();
        this.loadSchedule();
    }

    getEventsForDay(date: Date): PlanningDTO[] {
        const dateStr = this.formatLocalDate(date);
        return this.schedule()
            .filter(event => event.date === dateStr)
            .sort((a, b) => (a.timeSlotLabel || '').localeCompare(b.timeSlotLabel || ''));
    }

    formatDateHeader(date: Date): string {
        return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(date);
    }

    private getStartOfWeek(date: Date): Date {
        const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = result.getDay();
        const diff = (day === 0 ? -6 : 1) - day; // Règle pour Lundi comme 1er jour
        result.setDate(result.getDate() + diff);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    private formatLocalDate(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
}
