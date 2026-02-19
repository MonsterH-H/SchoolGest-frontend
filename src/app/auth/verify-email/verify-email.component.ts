import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class VerifyEmailComponent implements OnInit {
  verificationForm: FormGroup;
  email: string | null = null;
  isLoading = false;
  isVerifying = false;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'];
    const autoCode = this.route.snapshot.queryParams['code'];

    if (this.email && autoCode) {
      this.verifyEmail(this.email, autoCode);
    }
  }

  onSubmit(): void {
    if (this.verificationForm.invalid || !this.email) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.verifyEmail(this.email, this.verificationForm.get('code')?.value);
  }

  private verifyEmail(email: string, code: string): void {
    this.isVerifying = true;
    this.authService.verifyEmail(email, code)
      .pipe(finalize(() => this.isVerifying = false))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Votre e-mail a été vérifié avec succès !');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.notificationService.showError(error.message || 'La vérification a échoué.');
        }
      });
  }
}
