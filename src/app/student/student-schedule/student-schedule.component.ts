import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../../core/services/schedule.service';
import { AuthService } from '../../core/services/auth.service';
import { PlanningDTO } from '../../shared/models/api-schemas';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './student-schedule.component.html'
})
export class StudentScheduleComponent implements OnInit {
  schedule = signal<PlanningDTO[]>([]);
  isLoading = signal<boolean>(false);
  currentDate = signal<Date>(new Date());
  weekDays = signal<Date[]>([]);
  classeId: number | null = null;

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.generateWeekDays();
    this.authService.getMe().subscribe(user => {
      const classeId = user?.academicDetails?.classeId;
      if (typeof classeId === 'number') {
        this.classeId = classeId;
        this.loadSchedule();
      }
    });
  }

  generateWeekDays(): void {
    const start = this.getStartOfWeek(this.currentDate());
    const days = [];
    for (let i = 0; i < 6; i++) {
      days.push(this.addDays(start, i));
    }
    this.weekDays.set(days);
  }

  loadSchedule(): void {
    if (!this.classeId) return;
    
    this.isLoading.set(true);
    const start = this.getStartOfWeek(this.currentDate());
    const end = this.addDays(start, 6);
    const startStr = this.formatLocalDate(start);
    const endStr = this.formatLocalDate(end);

    this.scheduleService.getParClasse(this.classeId, startStr, endStr).subscribe({
      next: (data) => {
        this.schedule.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading schedule', err);
        this.isLoading.set(false);
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
      .sort((a, b) => {
        const aStart = this.getStartTimeFromLabel(a.timeSlotLabel);
        const bStart = this.getStartTimeFromLabel(b.timeSlotLabel);
        return aStart.localeCompare(bStart);
      });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = result.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
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

  private getStartTimeFromLabel(label?: string): string {
    if (!label) return '';
    const match = label.match(/\b(\d{1,2}:\d{2})\b/);
    return match?.[1] ?? label;
  }
}
