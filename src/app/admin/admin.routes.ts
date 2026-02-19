import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./users-list/users-list.component').then(m => m.UsersListComponent)
  },
  {
    path: 'attendance',
    loadComponent: () => import('./attendance-admin/attendance-admin.component').then(m => m.AttendanceAdminComponent)
  },
  {
    path: 'planning',
    loadComponent: () => import('./planning/planning.component').then(m => m.PlanningComponent)
  },
  {
    path: 'classes',
    loadComponent: () => import('./classe/classe.component').then(m => m.ClasseComponent)
  },
  {
    path: 'classes/:id/students',
    loadComponent: () => import('./class-students/class-students.component').then(m => m.ClassStudentsComponent)
  },
  {
    path: 'structure',
    children: [
      {
        path: 'subjects',
        loadComponent: () => import('./structure/subject-list/subject-list.component').then(m => m.SubjectListComponent)
      },
      {
        path: 'modules',
        loadComponent: () => import('./structure/module-list/module-list.component').then(m => m.ModuleListComponent)
      },
      {
        path: 'semesters',
        loadComponent: () => import('./structure/semester-list/semester-list.component').then(m => m.SemesterListComponent)
      },
      {
        path: 'establishments',
        loadComponent: () => import('./structure/establishment-list/establishment-list.component').then(m => m.EstablishmentListComponent)
      },
      {
        path: 'enrollment',
        loadComponent: () => import('./structure/enrollment/enrollment.component').then(m => m.EnrollmentComponent)
      }
    ]
  },
  {
    path: 'monitoring',
    loadComponent: () => import('./monitoring/system-status/system-status.component').then(m => m.SystemStatusComponent)
  },
  {
    path: 'textbook',
    loadComponent: () => import('./textbook-admin/textbook-admin.component').then(m => m.TextbookAdminComponent)
  },
  {
    path: 'evaluations',
    loadComponent: () => import('./evaluations/evaluation-admin/evaluation-admin.component').then(m => m.EvaluationAdminComponent)
  },
  {
    path: 'resources',
    loadComponent: () => import('./resources/resource-admin/resource-admin.component').then(m => m.ResourceAdminComponent)
  },
  {
    path: 'reports',
    children: [
      {
        path: 'bulletins',
        loadComponent: () => import('./reports/bulletin-admin/bulletin-admin.component').then(m => m.BulletinAdminComponent)
      }
    ]
  },
  {
    path: 'infrastructure',
    children: [
      {
        path: 'rooms',
        loadComponent: () => import('./infrastructure/room-list/room-list.component').then(m => m.RoomListComponent)
      },
      {
        path: 'timeslots',
        loadComponent: () => import('../modules/schedule/pages/timeslot-list/timeslot-list.component').then(m => m.TimeslotListComponent)
      }
    ]
  }
];