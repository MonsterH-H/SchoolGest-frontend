import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { passwordMatchValidator } from '../../shared/validators/password.validator';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  private token: string | null = null;
  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.notificationService.showError('Lien de réinitialisation invalide.');
      this.router.navigate(['/auth/forgot-password']);
      return;
    }
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { password } = this.resetPasswordForm.value;

    this.authService.resetPassword({ token: this.token, password })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Votre mot de passe a été réinitialisé avec succès');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.notificationService.showError(error.message || 'La réinitialisation a échoué.');
        }
      });
  }

  get passwordError(): string | null {
    const control = this.resetPasswordForm.get('password');
    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) return 'Le mot de passe est requis';
      if (control.errors['minlength']) return 'Au moins 8 caractères requis';
      if (control.errors['pattern']) return 'Doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial';
    }
    return null;
  }

  get confirmPasswordError(): string | null {
    const control = this.resetPasswordForm.get('confirmPassword');
    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) return 'La confirmation est requise';
      if (this.resetPasswordForm.errors?.['passwordMismatch']) return 'Les mots de passe ne correspondent pas';
    }
    return null;
  }
}
