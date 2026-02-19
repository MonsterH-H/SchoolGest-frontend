import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { EvaluationService } from '../../core/services/evaluation.service';
import { Grade } from '../../shared/models/api-schemas';

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-grades.component.html'
})
export class StudentGradesComponent implements OnInit {
  private authService = inject(AuthService);
  private evaluationService = inject(EvaluationService);

  grades = signal<Grade[]>([]);
  isLoading = signal<boolean>(false);
  studentId = signal<number | null>(null);

  ngOnInit(): void {
    this.isLoading.set(true);

    this.authService.getMe().pipe(
      switchMap(user => {
        const id = user?.academicDetails?.id;
        if (typeof id !== 'number') {
          this.studentId.set(null);
          return of<Grade[]>([]);
        }
        this.studentId.set(id);
        return this.evaluationService.getStudentGrades(id);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (grades) => {
        const sorted = (grades ?? []).slice().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        this.grades.set(sorted);
      },
      error: (err) => {
        console.error('Erreur chargement notes', err);
        this.grades.set([]);
      }
    });
  }

  getNoteLabel(grade: Grade): string {
    const score = typeof grade.score === 'number' ? grade.score : 0;
    const max = typeof grade.maxScore === 'number' ? grade.maxScore : 20;
    return `${score}/${max}`;
  }

  getScorePercent(grade: Grade): number {
    const score = typeof grade.score === 'number' ? grade.score : 0;
    const max = typeof grade.maxScore === 'number' ? grade.maxScore : 0;
    if (max <= 0) return 0;
    return Math.round((score / max) * 100);
  }
}
