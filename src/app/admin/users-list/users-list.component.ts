import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AcademicService } from '../../core/services/academic.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserResponseDTO, ClasseDTO, Role } from '../../shared/models/api-schemas';
import { finalize, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserFormComponent],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  private adminService = inject(AdminService);
  private userService = inject(UserService);
  private academicService = inject(AcademicService);
  private notificationService = inject(NotificationService);

  users = signal<UserResponseDTO[]>([]);
  isLoading = signal<boolean>(false);

  // Filters & Search
  searchTerm = signal<string>('');
  selectedRole = signal<string>('');
  selectedStatus = signal<string>('');

  // Selection & Batch
  selectedUsers = signal<number[]>([]);

  // Enrollment
  showEnrollModal = signal<boolean>(false);
  classes = signal<ClasseDTO[]>([]);
  enrollmentClasseId = signal<number | null>(null);
  enrollTargetUser = signal<UserResponseDTO | null>(null);

  // User Form Modal
  showUserForm = signal<boolean>(false);
  selectedUser = signal<UserResponseDTO | null>(null);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadClasses();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    const active = this.selectedStatus() === '' ? undefined : (this.selectedStatus() === 'active');

    this.userService.searchUsers(this.searchTerm(), this.selectedRole() || undefined, active)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.users.set(data);
          this.selectedUsers.set([]); // Reset selection on reload
        },
        error: () => this.notificationService.showError('Erreur chargement utilisateurs')
      });
  }

  loadClasses(): void {
    this.academicService.getClasses().subscribe(data => this.classes.set(data));
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  onRoleChange(role: string): void {
    this.selectedRole.set(role);
    this.loadUsers();
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.loadUsers();
  }

  toggleUserStatus(user: UserResponseDTO): void {
    const newStatus = !user.active;
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Statut de ${user.username} mis à jour`);
        this.loadUsers();
      },
      error: () => this.notificationService.showError('Erreur mise à jour statut')
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Utilisateur supprimé');
          this.loadUsers();
        },
        error: () => this.notificationService.showError('Erreur suppression')
      });
    }
  }

  // --- SELECTION LOGIC ---
  toggleUserSelection(userId: number): void {
    this.selectedUsers.update(ids =>
      ids.includes(userId) ? ids.filter(id => id !== userId) : [...ids, userId]
    );
  }

  toggleAll(event: any): void {
    if (event.target.checked) {
      this.selectedUsers.set(this.users().map(u => u.id));
    } else {
      this.selectedUsers.set([]);
    }
  }

  // --- BATCH ACTIONS ---
  deleteBatch(): void {
    if (this.selectedUsers().length === 0) return;
    if (confirm(`Supprimer ces ${this.selectedUsers().length} utilisateurs ?`)) {
      this.adminService.deleteUsersBatch(this.selectedUsers()).subscribe({
        next: () => {
          this.notificationService.showSuccess('Suppression groupée réussie');
          this.loadUsers();
        },
        error: () => this.notificationService.showError('Erreur suppression groupée')
      });
    }
  }

  updateBatchStatus(active: boolean): void {
    if (this.selectedUsers().length === 0) return;

    const actionLabel = active ? 'activation' : 'désactivation';
    if (confirm(`Confirmer la ${actionLabel} de ${this.selectedUsers().length} utilisateurs ?`)) {
      this.adminService.updateUsersStatusBatch(this.selectedUsers(), active).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Batch de ${actionLabel} réussi`);
          this.loadUsers();
        },
        error: () => this.notificationService.showError(`Erreur lors du batch d'${actionLabel}`)
      });
    }
  }

  // --- ENROLLMENT ---
  openEnrollModal(user: UserResponseDTO): void {
    this.enrollTargetUser.set(user);
    this.showEnrollModal.set(true);
  }

  onEnroll(): void {
    if (!this.enrollTargetUser() || !this.enrollmentClasseId()) return;
    this.academicService.enrollStudent(this.enrollTargetUser()!.id, this.enrollmentClasseId()!).subscribe({
      next: () => {
        this.notificationService.showSuccess(`${this.enrollTargetUser()!.username} inscrit à la classe`);
        this.showEnrollModal.set(false);
        this.loadUsers();
      },
      error: () => this.notificationService.showError('Échec de l\'inscription')
    });
  }

  // --- USER FORM ---
  openUserForm(user: UserResponseDTO | null = null): void {
    this.selectedUser.set(user);
    this.showUserForm.set(true);
  }

  closeUserForm(): void {
    this.showUserForm.set(false);
    this.selectedUser.set(null);
  }

  onUserSaved(): void {
    this.loadUsers();
    this.closeUserForm();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-rose-100 text-rose-700';
      case 'ENSEIGNANT': return 'bg-indigo-100 text-indigo-700';
      case 'ETUDIANT': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
