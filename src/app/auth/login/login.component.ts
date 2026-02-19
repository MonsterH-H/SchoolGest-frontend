import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Role } from '../../shared/models/api-schemas';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl:'./login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.4s 0.2s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('shake', [
      state('error', style({ transform: 'translateX(0)' })),
      transition('* => error', [
        animate('0.5s', style({ transform: 'translateX(-10px)' })),
        animate('0.1s', style({ transform: 'translateX(10px)' })),
        animate('0.1s', style({ transform: 'translateX(-10px)' })),
        animate('0.1s', style({ transform: 'translateX(10px)' })),
        animate('0.1s', style({ transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  rememberMe = false;
  animationState = '';
  
  private destroy$ = new Subject<void>();
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Demo credentials removed per strict backend requirement
  
  ngOnInit(): void {
    this.checkExistingAuth();
    this.initializeForm();
    this.loadRememberedCredentials();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkExistingAuth(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });

    // Real-time validation feedback
    this.loginForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
        this.animationState = '';
      }
    });
  }

  private loadRememberedCredentials(): void {
    const remembered = localStorage.getItem('rememberedCredentials');
    if (remembered) {
      const credentials = JSON.parse(remembered);
      this.loginForm.patchValue(credentials);
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleRememberMe(): void {
    this.rememberMe = !this.rememberMe;
    if (!this.rememberMe) {
      localStorage.removeItem('rememberedCredentials');
    }
  }

  fillDemoCredentials(demo: any): void {
    this.loginForm.patchValue({
      username: demo.username,
      password: demo.password
    });
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.animationState = 'error';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.animationState = '';

    const { username, password } = this.loginForm.value;

    // Remember credentials if requested
    if (this.rememberMe) {
      localStorage.setItem('rememberedCredentials', JSON.stringify({ username }));
    }

    this.authService.login({ username, password }).pipe(
      finalize(() => this.isLoading = false),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Connexion réussie !');
        this.redirectBasedOnRole();
      },
      error: (error) => {
        this.handleLoginError(error);
      }
    });
  }

  private redirectBasedOnRole(): void {
    const role = this.authService.getUserRole();
    const user = this.authService.getCurrentUser();
    
    if (role === Role.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === Role.ENSEIGNANT) {
      this.router.navigate(['/teacher/dashboard']);
    } else if (role === Role.ETUDIANT) {
      this.router.navigate(['/student/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private handleLoginError(error: any): void {
    this.animationState = 'error';
    
    if (error.status === 401) {
      this.errorMessage = 'Identifiants incorrects. Veuillez vérifier votre nom d\'utilisateur et mot de passe.';
    } else if (error.status === 423) {
      this.errorMessage = 'Compte temporairement verrouillé. Contactez l\'administrateur.';
    } else if (error.status === 403) {
      this.errorMessage = 'Compte désactivé. Contactez l\'administrateur.';
    } else if (error.status === 0) {
      this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    } else {
      this.errorMessage = error.error?.message || 'Une erreur inattendue s\'est produite.';
    }

    this.notificationService.showError(this.errorMessage);
  }

  // Getters for template
  get usernameErrors() {
    const control = this.loginForm.get('username');
    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) return 'Le nom d\'utilisateur est requis';
      if (control.errors['minlength']) return 'Au moins 3 caractères requis';
      if (control.errors['pattern']) return 'Caractères autorisés: lettres, chiffres, ., _, -';
    }
    return null;
  }

  get passwordErrors() {
    const control = this.loginForm.get('password');
    if (control?.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) return 'Le mot de passe est requis';
      if (control.errors['minlength']) return 'Au moins 6 caractères requis';
    }
    return null;
  }
}





