import { environment } from '../../../environments/environment';

/**
 * Configuration centralisée des endpoints API pour SchoolGestApp.
 * Les chemins sont RELATIFS : buildApiUrl ajoute automatiquement environment.apiUrl.
 */
export const API_ENDPOINTS = {
  // ==== AUTH & USERS ====
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    ME: 'auth/me',
    REFRESH: 'auth/refresh',
    FORGOT_PASSWORD: 'auth/forgot-password',
    RESET_PASSWORD: 'auth/reset-password',
    VERIFY_EMAIL: 'auth/verify-email',
    PROFILE: 'auth/profile',
    CHANGE_PASSWORD: 'auth/change-password',
  },

  // ==== ADMINISTRATION ====
  ADMIN: {
    BASE: 'admin',
    DASHBOARD: 'admin/dashboard/stats',
    IMPORT_USERS: 'admin/import/users',
    EXPORT_USERS: 'admin/export/users',
    SYSTEM_STATUS: 'admin/system/status',
  },

  // ==== UTILISATEURS ====
  USERS: {
    BASE: 'users',
    BY_ID: (id: number | string) => `users/${id}`,
    STATUS: (id: number | string) => `users/${id}/status`,
    ROLE: (id: number | string) => `users/${id}/role`,
    BATCH_STATUS: 'users/batch/status',
    BATCH_DELETE: 'users/batch/delete',
    TEACHERS: 'users/teachers',
  },

  // ==== STRUCTURE ACADÉMIQUE ====
  STRUCTURE: {
    ESTABLISHMENTS: 'structure/establishments',
    ESTABLISHMENT_BY_ID: (id: number | string) => `structure/establishments/${id}`,
    MODULES: 'structure/modules',
    MODULES_BY_CLASSE: (id: number | string) => `structure/classes/${id}/modules`,
    MODULE_BY_ID: (id: number | string) => `structure/modules/${id}`,
    SUBJECTS: 'structure/subjects',
    SUBJECT_BY_ID: (id: number | string) => `structure/subjects/${id}`,
    SUBJECTS_BY_CLASSE: (id: number | string) => `structure/classes/${id}/subjects`,
    SUBJECTS_BY_MODULE: (id: number | string) => `structure/modules/${id}/subjects`,
    SUBJECT_MODULE: (id: number | string) => `structure/subjects/${id}/module`,
    CLASSES: 'structure/classes',
    CLASSE_BY_ID: (id: number | string) => `structure/classes/${id}`,
    STUDENTS_BY_CLASSE: (id: number | string) => `structure/classes/${id}/students`,
    GROUPS: (id: number | string) => `structure/classes/${id}/groups`,
    SEMESTERS: 'structure/semesters',
    SEMESTER_BY_ID: (id: number | string) => `structure/semesters/${id}`,
    ENROLL: 'structure/enroll',
  },

  // ==== ÉVALUATIONS & NOTES ====
  EVALUATIONS: {
    ASSIGNMENTS: 'evaluations/assignments',
    EXAMS: 'evaluations/exams',
    GRADES: 'evaluations/grades',
    GRADES_BATCH: 'evaluations/grades/batch',
    PUBLISH: 'evaluations/publish',
    VALIDATE: 'evaluations/validate',
    STUDENT_AVERAGE: (studentId: number | string) => `evaluations/student/${studentId}/average`,
    SUBJECT_STATS: (subjectId: number | string) => `evaluations/subject/${subjectId}/stats`,
    STUDENT_GRADES: (id: number | string) => `evaluations/etudiant/${id}/toutes`,
  },

  // ==== PRÉSENCES & ASSIDUITÉ ====
  ATTENDANCE: {
    MARK: 'presences/marquer',
    JUSTIFY: (id: number | string) => `presences/${id}/justifier`,
    VALIDATE_JUSTIFICATION: (id: number | string) => `presences/${id}/valider-justificatif`,
    STUDENT_STATS: (id: number | string) => `presences/stats/etudiant/${id}`,
    STUDENT_HISTORY: (id: number | string) => `presences/etudiant/${id}`,
  },

  // ==== EMPLOI DU TEMPS ====
  SCHEDULE: {
    SALLES: 'emploidutemps/salles',
    CRENEAUX: 'emploidutemps/creneaux',
    PLANNINGS: 'emploidutemps/plannings',
    BY_CLASSE: (id: number | string) => `emploidutemps/classe/${id}`,
    BY_TEACHER: (id: number | string) => `emploidutemps/enseignant/${id}`,
    ANNULER: (id: number | string) => `emploidutemps/plannings/${id}/annuler`,
    REPORTER: (id: number | string) => `emploidutemps/plannings/${id}/reporter`,
  },

  // ==== TRAVAUX & DEVOIRS ====
  TASKS: {
    DEVOIRS: 'travaux/devoirs',
    SUBMISSIONS: (id: number | string) => `travaux/devoirs/${id}/soumissions`,
    GRADE_SUBMISSION: (id: number | string) => `travaux/soumissions/${id}/noter`,
    SOLUTION: (id: number | string) => `travaux/devoirs/${id}/solution`,
    SUBMIT: (id: number | string) => `travaux/devoirs/${id}/rendre`,
    STUDENT_TASKS: (id: number | string) => `travaux/etudiant/${id}/devoirs`,
  },

  // ==== RESSOURCES PÉDAGOGIQUES ====
  RESOURCES: {
    BASE: 'ressources',
    BY_SUBJECT: (id: number | string) => `ressources/matiere/${id}`,
    BY_CLASSE: (id: number | string) => `ressources/classe/${id}`,
    DELETE: (id: number | string) => `ressources/${id}`,
  },

  // ==== COMMUNICATIONS ====
  COMMUNICATIONS: {
    MESSAGES: 'communications/messages',
    INBOX: (id: number | string) => `communications/boite-reception/${id}`,
    MARK_READ: (id: number | string) => `communications/messages/${id}/lire`,
    NOTIFICATIONS: (id: number | string) => `communications/notifications/${id}`,
    UNREAD_COUNT: (id: number | string) => `communications/non-lus/${id}`,
  },

  // ==== BULLETINS ====
  REPORT_CARDS: {
    BASE: 'bulletins',
    GENERATE: 'bulletins/generer',
    CALCULATE_RANKS: 'bulletins/calculer-rangs',
    BY_STUDENT: (id: number | string) => `bulletins/etudiant/${id}`,
    PDF: (id: number | string) => `bulletins/${id}/pdf`,
  },

  // ==== CAHIER DE TEXTE ====
  CAHIER_TEXTE: {
    BASE: 'cahier-texte',
    BY_CLASSE: (id: number | string) => `cahier-texte/classe/${id}`,
    BY_CLASSE_AND_DATE: (id: number | string, date: string) => `cahier-texte/classe/${id}/date/${date}`,
    SEANCES: 'cahier-texte/seances',
    SEANCES_BY_ID: (id: number | string) => `cahier-texte/seances/${id}`,
    BY_TEACHER: (id: number | string) => `cahier-texte/seances/enseignant/${id}`,
    ARCHIVER: (id: number | string) => `cahier-texte/${id}/archiver`,
  },

  // ==== PROFILS SPÉCIFIQUES ====
  PROFILES: {
    TEACHER: 'profils/enseignant',
    STUDENT: 'profils/etudiant',
  },

  // ==== STOCKAGE & FICHIERS ====
  STORAGE: {
    UPLOAD: 'stockage/upload',
  },

  // ==== ENSEIGNANT (DASHBOARD) ====
  TEACHER_DASHBOARD: {
    STATS: (id: number | string) => `teacher/${id}/dashboard-stats`,
    PENDING_ASSIGNMENTS: (id: number | string) => `teacher/${id}/assignments-pending`,
  },

} as const;

/**
 * Construit une URL complète à partir d'un endpoint relatif + params optionnels
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  let url = `${environment.apiUrl}/${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  return url;
}

/**
 * Construit une URL complète avec un ID
 */
export function buildApiUrlWithId(endpoint: string, id: string | number): string {
  return `${environment.apiUrl}/${endpoint}/${id}`;
}
