import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AcademicService } from '../../core/services/academic.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { StudentDTO, UserResponseDTO, ClasseDTO, Role } from '../../shared/models/api-schemas';

@Component({
  selector: 'app-class-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-students.component.html',
  styleUrls: ['./class-students.component.scss']
})
export class ClassStudentsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private academicService = inject(AcademicService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  classe = signal<ClasseDTO | null>(null);
  students = signal<StudentDTO[]>([]);
  isLoading = signal<boolean>(false);
  classId!: number;

  // Enroll Modal
  showEnrollModal = signal<boolean>(false);
  searchQuery = signal<string>('');
  potentialStudents = signal<UserResponseDTO[]>([]);
  isSearching = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.classId = +id;
      this.loadClasseInfo();
      this.loadStudents();
    }
  }

  loadClasseInfo(): void {
    // Assuming a method exists to get classe by id
    // If not, we can filter from getClasses()
    this.academicService.getClasses().subscribe(classes => {
        const foundClasse = classes.find(c => c.id === this.classId);
        if(foundClasse) {
            this.classe.set(foundClasse);
        }
    });
  }

  loadStudents(): void {
    this.isLoading.set(true);
    this.academicService.getStudentsByClasse(this.classId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.students.set(data),
        error: () => this.notificationService.showError("Erreur lors du chargement des étudiants.")
      });
  }

  openEnrollModal(): void {
    this.showEnrollModal.set(true);
    this.searchPotentialStudents();
  }

  searchPotentialStudents(): void {
    this.isSearching.set(true);
    this.userService.getUsers(this.searchQuery(), Role.ETUDIANT)
      .pipe(finalize(() => this.isSearching.set(false)))
      .subscribe(users => {
        const currentStudentIds = this.students().map(s => s.id);
        this.potentialStudents.set(users.filter(u => !currentStudentIds.includes(u.id)));
      });
  }

  enrollStudent(studentId: number): void {
    this.academicService.enrollStudent(studentId, this.classId).subscribe({
      next: () => {
        this.notificationService.showSuccess("Étudiant inscrit avec succès.");
        this.loadStudents(); // Refresh the list
        this.showEnrollModal.set(false);
      },
      error: (err) => this.notificationService.showError(err.error?.message || "Erreur lors de l'inscription.")
    });
  }

  unenrollStudent(studentId: number): void {
    if (confirm("Voulez-vous vraiment désinscrire cet étudiant de la classe ?")) {
      this.academicService.unenrollStudent(studentId, this.classId).subscribe({
        next: () => {
          this.notificationService.showSuccess("Étudiant désinscrit avec succès.");
          this.students.update(s => s.filter(student => student.id !== studentId));
        },
        error: (err) => this.notificationService.showError(err.error?.message || "Erreur lors de la désinscription.")
      });
    }
  }
}
