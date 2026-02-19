import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Role, RegisterRequest, Gender } from '../../shared/models/api-schemas';
import { passwordMatchValidator } from '../../shared/validators/password.validator';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  animations: [
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('0.5s cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'translateX(-30px)' }))
      ])
    ])
  ]
})
export class RegisterComponent implements OnInit {
  public Role = Role;
  public Gender = Gender;
  currentStep = 1;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  photoPreview: string | null = null;
  selectedPhoto: File | null = null;

  accountForm: FormGroup;
  profileForm: FormGroup;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.accountForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6), // Relaxed to match backend message (6 min)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });

    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      role: [Role.ETUDIANT, [Validators.required]],

      // Student specific
      birthDate: [''],
      gender: [Gender.M],

      // Teacher specific
      hireDate: [''],

      // Codes are optional, backend generates if missing
      userCode: ['']
    });

    // Dynamic validation based on role
    this.profileForm.get('role')?.valueChanges.subscribe(role => {
      this.updateValidators(role);
    });
  }

  ngOnInit(): void {
    this.updateValidators(Role.ETUDIANT);
  }

  private updateValidators(role: Role) {
    const birthDate = this.profileForm.get('birthDate');
    const gender = this.profileForm.get('gender');
    const hireDate = this.profileForm.get('hireDate');

    if (role === Role.ETUDIANT) {
      birthDate?.setValidators([Validators.required]);
      gender?.setValidators([Validators.required]);
      hireDate?.clearValidators();
    } else if (role === Role.ENSEIGNANT) {
      birthDate?.clearValidators();
      gender?.clearValidators();
      hireDate?.setValidators([Validators.required]);
    }

    birthDate?.updateValueAndValidity();
    gender?.updateValueAndValidity();
    hireDate?.updateValueAndValidity();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      const reader = new FileReader();
      reader.onload = () => this.photoPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.accountForm.valid) {
      this.currentStep = 2;
    } else {
      this.accountForm.markAllAsTouched();
    }
  }

  prevStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  onRegister(): void {
    if (this.accountForm.invalid || this.profileForm.invalid) {
      this.accountForm.markAllAsTouched();
      this.profileForm.markAllAsTouched();
      this.notificationService.showError('Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const accountVal = this.accountForm.value;
    const profileVal = this.profileForm.value;

    const request: RegisterRequest = {
      username: accountVal.username,
      email: accountVal.email,
      password: accountVal.password,
      role: profileVal.role,
      firstName: profileVal.firstName,
      lastName: profileVal.lastName,
      phone: profileVal.phone,
      address: profileVal.address,
      birthDate: profileVal.role === Role.ETUDIANT ? profileVal.birthDate : undefined,
      gender: profileVal.role === Role.ETUDIANT ? profileVal.gender : undefined,
      hireDate: profileVal.role === Role.ENSEIGNANT ? profileVal.hireDate : undefined,
      studentCode: (profileVal.role === Role.ETUDIANT && profileVal.userCode) ? profileVal.userCode : undefined,
      teacherCode: (profileVal.role === Role.ENSEIGNANT && profileVal.userCode) ? profileVal.userCode : undefined
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(request));
    if (this.selectedPhoto) {
      formData.append('photo', this.selectedPhoto);
    }

    this.authService.register(formData).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res) => {
        if (res.accessToken) {
          this.notificationService.showSuccess('Compte créé et connecté !');
          this.redirectUser(res.user.role);
        } else {
          this.notificationService.showInfo('Inscription réussie ! Votre compte est en attente de validation par l\'administration.');
          setTimeout(() => this.router.navigate(['/login']), 4000);
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Une erreur est survenue lors de l\'inscription.';
        this.notificationService.showError(this.errorMessage);
      }
    });
  }

  private redirectUser(role: string): void {
    setTimeout(() => {
      const r = role.toUpperCase();
      if (r.includes('ADMIN')) this.router.navigate(['/admin/dashboard']);
      else if (r.includes('ENSEIGNANT')) this.router.navigate(['/teacher/dashboard']);
      else this.router.navigate(['/student/dashboard']);
    }, 2000);
  }

  get passwordStrength(): number {
    const pass = this.accountForm.get('password')?.value || '';
    let strength = 0;
    if (pass.length >= 6) strength += 25;
    if (pass.length >= 10) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    return strength;
  }
}