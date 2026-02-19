import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard-student/dashboard-student.component').then(m => m.DashboardStudentComponent)
    },
    {
        path: 'schedule',
        loadComponent: () => import('./student-schedule/student-schedule.component').then(m => m.StudentScheduleComponent)
    },
    {
        path: 'grades',
        loadComponent: () => import('./student-grades/student-grades.component').then(m => m.StudentGradesComponent)
    }
];
