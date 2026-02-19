import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcademicService } from '../../core/services/academic.service';
import { NotificationService } from '../../core/services/notification.service';
import { ClasseDTO, Classe } from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-classe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './classe.component.html'
})
export class ClasseComponent implements OnInit {
  private academicService = inject(AcademicService);
  private notificationService = inject(NotificationService);

  classes = signal<ClasseDTO[]>([]);
  isLoading = signal<boolean>(false);
  showAddModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);

  // New Classe Model
  newClasse: Partial<Classe> = {
    name: '',
    code: '',
    academicYear: '2025-2026',
    maxCapacity: 30,
    type: 'INITIAL'
  };

  editClasseId = signal<number | null>(null);
  editClasse: Partial<Classe> = {};

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.isLoading.set(true);
    this.academicService.getClasses()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.classes.set(data),
        error: () => this.notificationService.showError('Erreur chargement des classes')
      });
  }

  onCreateClasse(): void {
    if (!this.newClasse.name || !this.newClasse.code) {
      this.notificationService.showError('Le nom et le code sont obligatoires');
      return;
    }

    this.academicService.createClasse(this.newClasse as Classe).subscribe({
      next: (created) => {
        this.loadClasses();
        this.notificationService.showSuccess(`Classe ${created.name} créée`);
        this.showAddModal.set(false);
        this.resetForm();
      },
      error: () => this.notificationService.showError('Erreur création de la classe')
    });
  }

  deleteClasse(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette classe ?')) {
      this.academicService.deleteClasse(id).subscribe({
        next: () => {
          this.classes.update(prev => prev.filter(c => c.id !== id));
          this.notificationService.showSuccess('Classe supprimée');
        },
        error: () => this.notificationService.showError('Erreur suppression')
      });
    }
  }

  openEditModal(classe: ClasseDTO): void {
    this.editClasseId.set(classe.id);
    this.editClasse = {
      name: classe.name,
      code: classe.code,
      academicYear: classe.academicYear,
      maxCapacity: classe.maxCapacity,
      type: classe.type
    };
    this.showEditModal.set(true);
  }

  onUpdateClasse(): void {
    const id = this.editClasseId();
    if (!id) return;
    if (!this.editClasse.name || !this.editClasse.code) {
      this.notificationService.showError('Le nom et le code sont obligatoires');
      return;
    }

    this.academicService.updateClasse(id, this.editClasse).subscribe({
      next: () => {
        this.notificationService.showSuccess('Classe mise à jour');
        this.showEditModal.set(false);
        this.editClasseId.set(null);
        this.editClasse = {};
        this.loadClasses();
      },
      error: () => this.notificationService.showError('Erreur mise à jour de la classe')
    });
  }

  private resetForm() {
    this.newClasse = {
      name: '',
      code: '',
      academicYear: '2025-2026',
      maxCapacity: 30,
      type: 'INITIAL'
    };
  }
}
