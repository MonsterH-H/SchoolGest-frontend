import { Component, OnInit, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserResponseDTO, Role } from '../../../shared/models/api-schemas';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  @Input() user: UserResponseDTO | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<void>();

  userForm!: FormGroup;
  isSaving = signal<boolean>(false);
  roles = Object.values(Role);

  ngOnInit(): void {
    this.userForm = this.fb.group({
      id: [null],
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.ETUDIANT, Validators.required],
      password: [''] // Password is not required for update
    });

    if (this.user) {
      this.userForm.patchValue(this.user);
      // If we are editing, password is not mandatory
      this.userForm.get('password')?.clearValidators();
    } else {
      // If we are creating, password is required
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.notificationService.showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.isSaving.set(true);
    const userData = this.userForm.getRawValue();

    const apiCall = this.user
      ? this.userService.updateUser(this.user.id, userData)
      : this.userService.createUser(userData);

    apiCall.pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Utilisateur sauvegardé avec succès.');
        this.userSaved.emit();
        this.close.emit();
      },
      error: (err: any) => {
        const message = err.error?.message || 'Erreur lors de la sauvegarde de l\'utilisateur.';
        this.notificationService.showError(message);
      }
    });
  }
}
