import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { HomeComponent } from './home/home.component';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { Role } from './shared/models/api-schemas';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'access-denied', loadComponent: () => import('./auth/access-denied/access-denied.component').then(m => m.AccessDeniedComponent) },

  // Shared Authenticated Routes
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },

      // Admin Area (Nested)
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },

      // Teacher Area (Nested)
      {
        path: 'teacher',
        canActivate: [roleGuard],
        data: { roles: [Role.ENSEIGNANT] },
        loadChildren: () => import('./teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
      },

      // Student Area (Nested)
      {
        path: 'student',
        canActivate: [roleGuard],
        data: { roles: [Role.ETUDIANT] },
        loadChildren: () => import('./student/student.routes').then(m => m.STUDENT_ROUTES)
      }
    ]
  },

  { path: '**', component: NotFoundComponent }
];