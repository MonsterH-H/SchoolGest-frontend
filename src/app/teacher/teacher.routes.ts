import { Routes } from '@angular/router';

export const TEACHER_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard-teacher/dashboard-teacher.component').then(m => m.DashboardTeacherComponent)
    },
    {
        path: 'schedule',
        loadComponent: () => import('./schedule-teacher/schedule-teacher.component').then(m => m.ScheduleTeacherComponent)
    },
    {
        path: 'attendance',
        loadComponent: () => import('./attendance-teacher/attendance-teacher.component').then(m => m.AttendanceTeacherComponent)
    },
    {
        path: 'textbook',
        loadComponent: () => import('./textbook-teacher/textbook-teacher.component').then(m => m.TextbookTeacherComponent)
    },
    {
        path: 'evaluations',
        loadComponent: () => import('./evaluation-teacher/evaluation-teacher.component').then(m => m.EvaluationTeacherComponent)
    },
    {
        path: 'assignments',
        loadComponent: () => import('./assignment-teacher/assignment-teacher.component').then(m => m.AssignmentTeacherComponent)
    },
    {
        path: 'resources',
        loadComponent: () => import('./resource-teacher/resource-teacher.component').then(m => m.ResourceTeacherComponent)
    }
];
