import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserResponseDTO } from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';
import { passwordMatchValidator } from '../../shared/validators/password.validator';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);
    private fb = inject(FormBuilder);

    user = signal<UserResponseDTO | null>(null);
    isLoading = signal<boolean>(false);
    selectedFile: File | null = null;

    profileData = {
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
    };

    changePasswordForm: FormGroup;
    isPasswordLoading = signal<boolean>(false);

    constructor() {
        this.changePasswordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required]
        }, { validators: passwordMatchValidator });
    }

    ngOnInit(): void {
        this.authService.getMe().subscribe(); // Refresh user data on load
        this.authService.currentUser$.subscribe(u => {
            if (u) {
                this.user.set(u);
                this.profileData = {
                    firstName: u.firstName || '',
                    lastName: u.lastName || '',
                    phone: u.phone || '',
                    address: u.address || ''
                };
            }
        });
    }

    onFileChange(event: any): void {
        this.selectedFile = event.target.files[0];
    }

    updateProfile(): void {
        this.isLoading.set(true);
        const formData = new FormData();
        formData.append('data', JSON.stringify(this.profileData));
        if (this.selectedFile) {
            formData.append('photo', this.selectedFile);
        }

        this.authService.updateProfile(formData)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => this.notificationService.showSuccess('Profil mis à jour'),
                error: (err) => this.notificationService.showError(err.message || 'Erreur lors de la mise à jour')
            });
    }

    changePassword(): void {
        if (this.changePasswordForm.invalid) return;

        this.isPasswordLoading.set(true);
        const { currentPassword, newPassword } = this.changePasswordForm.value;

        this.authService.changePassword({ currentPassword, newPassword })
            .pipe(finalize(() => this.isPasswordLoading.set(false)))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess('Mot de passe modifié avec succès');
                    this.changePasswordForm.reset();
                },
                error: (err) => this.notificationService.showError(err.message || 'Erreur lors du changement de mot de passe')
            });
    }
}
