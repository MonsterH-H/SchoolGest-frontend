import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ScheduleService } from '../../core/services/schedule.service';
import { AcademicService } from '../../core/services/academic.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  Planning,
  ClasseDTO,
  SalleDTO,
  SubjectDTO,
  ModuleDTO,
  TeacherDTO,
  TimeSlotDTO,
  CourseType
} from '../../shared/models/api-schemas';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  private scheduleService = inject(ScheduleService);
  private academicService = inject(AcademicService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  classes = signal<ClasseDTO[]>([]);
  modules = signal<ModuleDTO[]>([]);
  subjects = signal<SubjectDTO[]>([]);
  rooms = signal<SalleDTO[]>([]);
  teachers = signal<TeacherDTO[]>([]);
  timeSlots = signal<TimeSlotDTO[]>([]);
  plannings = signal<Planning[]>([]);
  selectedClasseId = signal<number | null>(null);
  selectedModuleId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  editPlanningId = signal<number | null>(null);

  planningForm = this.fb.group({
    date: ['', Validators.required],
    courseType: [CourseType.CM, Validators.required],
    subjectId: [null as number | null, Validators.required],
    teacherId: [null as number | null, Validators.required],
    roomId: [null as number | null, Validators.required],
    timeSlotId: [null as number | null, Validators.required]
  });

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading.set(true);
    forkJoin({
      classes: this.academicService.getClasses(),
      rooms: this.academicService.getSalles(),
      teachers: this.userService.getTeachers(),
      timeSlots: this.scheduleService.listerCreneaux()
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ classes, rooms, teachers, timeSlots }) => {
          this.classes.set(classes);
          this.rooms.set(rooms);
          this.teachers.set(teachers);
          this.timeSlots.set(timeSlots);
        },
        error: () => this.notificationService.showError('Erreur chargement des données')
      });
  }

  onClasseChange() {
    if (this.selectedClasseId()) {
      this.loadModulesAndSubjects();
      this.loadPlanning();
    }
  }

  loadModulesAndSubjects(): void {
    const classeId = this.selectedClasseId();
    this.selectedModuleId.set(null);
    this.planningForm.patchValue({ subjectId: null });
    this.modules.set([]);
    this.subjects.set([]);

    if (!classeId) return;

    this.academicService.getModulesByClasse(classeId).subscribe({
      next: (data) => this.modules.set(data),
      error: () => this.notificationService.showError('Erreur chargement modules')
    });

    this.academicService.getSubjectsByClasse(classeId).subscribe({
      next: (data) => this.subjects.set(data),
      error: () => this.notificationService.showError('Erreur chargement matières')
    });
  }

  onModuleChange(): void {
    const moduleId = this.selectedModuleId();
    const classeId = this.selectedClasseId();
    this.planningForm.patchValue({ subjectId: null });

    if (!moduleId) {
      if (classeId) {
        this.academicService.getSubjectsByClasse(classeId).subscribe({
          next: (data) => this.subjects.set(data),
          error: () => this.notificationService.showError('Erreur chargement matières')
        });
      }
      return;
    }

    this.academicService.getSubjectsByModule(moduleId).subscribe({
      next: (data) => this.subjects.set(data),
      error: () => this.notificationService.showError('Erreur chargement matières')
    });
  }

  loadPlanning() {
    if (!this.selectedClasseId()) return;
    this.isLoading.set(true);
    // Showing planning for current week (simplified: just fetch for class)
    // Note: getParClasse expects dates, let's use a wide range for now
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    this.scheduleService.getParClasse(
      this.selectedClasseId()!,
      oneYearAgo.toISOString().split('T')[0],
      oneYearLater.toISOString().split('T')[0]
    ).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => this.plannings.set(data),
      error: () => this.notificationService.showError('Erreur chargement planning')
    });
  }

  onSubmit() {
    if (this.planningForm.valid && this.selectedClasseId()) {
      const formValue = this.planningForm.value;
      const payload: Partial<Planning> = {
        date: formValue.date!,
        courseType: formValue.courseType!,
        subjectId: formValue.subjectId!,
        teacherId: formValue.teacherId!,
        roomId: formValue.roomId!,
        timeSlotId: formValue.timeSlotId!,
        classeId: this.selectedClasseId()!,
      };

      const editingId = this.editPlanningId();
      const request$ = editingId
        ? this.scheduleService.updatePlanning(editingId, payload)
        : this.scheduleService.planifierCours({ ...payload, cancelled: false } as Planning);

      request$.subscribe({
        next: () => {
          this.notificationService.showSuccess(editingId ? 'Séance mise à jour' : 'Cours planifié avec succès');
          this.closeModal();
          this.loadPlanning();
        },
        error: (err) => this.notificationService.showError('Erreur: ' + (err?.error?.message || err?.message || ''))
      });
    }
  }

  cancelPlanning(id: number) {
    if (confirm('Êtes-vous sûr de vouloir annuler ce cours ?')) {
      this.scheduleService.annuler(id, 'Annulation par l\'administrateur').subscribe({
        next: () => {
          this.notificationService.showSuccess('Cours annulé');
          this.loadPlanning();
        },
        error: () => this.notificationService.showError('Échec de l\'annulation')
      });
    }
  }

  deletePlanning(id: number): void {
    if (confirm('Supprimer définitivement cette séance ?')) {
      this.scheduleService.deletePlanning(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Séance supprimée');
          this.loadPlanning();
        },
        error: () => this.notificationService.showError('Échec de la suppression')
      });
    }
  }

  openEditModal(plan: Planning): void {
    this.editPlanningId.set(plan.id);
    this.isModalOpen.set(true);

    const moduleId = this.subjects().find(s => s.id === plan.subjectId)?.moduleId ?? null;
    this.selectedModuleId.set(moduleId);
    if (moduleId) this.onModuleChange();

    this.planningForm.reset({
      date: plan.date,
      courseType: plan.courseType ?? CourseType.CM,
      subjectId: plan.subjectId ?? null,
      teacherId: plan.teacherId ?? null,
      roomId: plan.roomId ?? null,
      timeSlotId: plan.timeSlotId ?? null
    });
  }

  openAddModal() {
    this.editPlanningId.set(null);
    this.selectedModuleId.set(null);
    this.planningForm.reset({
      date: '',
      courseType: CourseType.CM,
      subjectId: null,
      teacherId: null,
      roomId: null,
      timeSlotId: null
    });

    // Load modules and subjects for the selected class
    if (this.selectedClasseId()) {
      this.loadModulesAndSubjects();
    }

    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editPlanningId.set(null);
  }
}
