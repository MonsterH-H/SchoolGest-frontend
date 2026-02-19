import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '@shared/models/api-schemas';
import { finalize } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  userForm: FormGroup;
  userId: string | null = null;
  isEditMode = false;
  isLoading = false;
  
  constructor() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.isLoading = true;
      this.userService.getUserById(this.userId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (user: User) => {
            this.userForm.patchValue(user);
          },
          error: () => {
            this.router.navigate(['/admin/users']);
          }
        });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const userData = this.userForm.value;

    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, userData)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => this.router.navigate(['/admin/users']),
          error: (err) => console.error(err)
        });
    } else {
      this.userService.createUser(userData)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => this.router.navigate(['/admin/users']),
          error: (err) => console.error(err)
        });
    }
  }
}