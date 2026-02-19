/**
 * Interfaces TypeScript générées à partir des schémas du backend SchoolGestApp
 * Ces interfaces correspondent EXACTEMENT à la spécification OpenAPI v1.5.0
 * Dernière synchronisation: Janvier 2026
 */

// ================== ENUMS (CORRESPONDANCE EXACTE BACKEND) ==================

export enum Role {
  ADMIN = 'ADMIN',
  ENSEIGNANT = 'ENSEIGNANT',
  ETUDIANT = 'ETUDIANT'
}

export type UserRole = Role;

export enum EvaluationType {
  DEVOIR = 'DEVOIR',
  EXAMEN_FINAL = 'EXAMEN_FINAL',
  EXAMEN_PARTIEL = 'EXAMEN_PARTIEL',
  CONTROLE_CONTINU = 'CONTROLE_CONTINU',
  PROJET = 'PROJET',
  PARTICIPATION = 'PARTICIPATION'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  RETARD = 'RETARD',
  EXCUSE = 'EXCUSE'
}

export enum JustificationStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum StudentStatus {
  INSCRIT = 'INSCRIT',
  DIPLOME = 'DIPLOME',
  ABANDON = 'ABANDON'
}

export enum EvaluationStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  GRADING = 'GRADING',
  VALIDATED = 'VALIDATED',
  ARCHIVED = 'ARCHIVED'
}

export enum Gender {
  M = 'M',
  F = 'F',
  AUTRE = 'AUTRE'
}

export type Sexe = Gender;

export enum CourseType {
  CM = 'CM',
  TD = 'TD',
  TP = 'TP'
}

// ================== BASE MODELS ==================

export interface LocalTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
  active: boolean;
  createdAt?: string;
  lastLogin?: string;
  avatarUrl?: string;
  address?: string;
  emailVerified: boolean;
}

export interface UserResponseDTO extends User {
  academicDetails?: any;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  hireDate?: string;
  avatarUrl?: string;
  studentCode?: string;
  teacherCode?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken?: string;
  user: UserResponseDTO;
}

// ================== ACADEMIC STRUCTURE ==================

export interface Establishment {
  id: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  academicParameters?: string;
  academicYears?: string;
}

export interface EstablishmentDTO extends Establishment { }

export interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  establishment?: Establishment;
}

export interface Module {
  id: number;
  name: string;
  credits: number;
  classe?: Classe;
  semester?: Semester;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleDTO {
  id: number;
  name: string;
  credits: number;
  classeId?: number;
  classeName?: string;
  semesterId?: number;
  semesterName?: string;
  subjects?: SubjectDTO[];
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  hoursCM?: number;
  hoursTD?: number;
  hoursTP?: number;
  credits?: number;
  coefficientCC?: number;
  coefficientExam?: number;
  description?: string;
  prerequisite?: string;
  module?: Module;
  teacher?: Teacher;
  semester?: Semester;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectDTO {
  id: number;
  code: string;
  name: string;
  hoursCM?: number;
  hoursTD?: number;
  hoursTP?: number;
  credits?: number;
  coefficientCC?: number;
  coefficientExam?: number;
  moduleId?: number;
  moduleName?: string;
  teacherId?: number;
  teacherName?: string;
  semesterId?: number;
  semesterName?: string;
}

export interface Classe {
  id: number;
  name: string;
  code: string;
  academicYear?: string;
  maxCapacity?: number;
  type?: string;
  parentClasse?: Classe;
  responsible?: Teacher;
  department?: Department;
}

export interface ClasseDTO {
  id: number;
  name: string;
  code: string;
  academicYear?: string;
  maxCapacity?: number;
  type?: string;
  parentClasseId?: number;
  parentClasseName?: string;
  responsibleId?: number;
  responsibleName?: string;
  departmentId?: number;
  departmentName?: string;
}

export interface Semester {
  id: number;
  name: string;
  academicYear?: string;
  startDate: string;
  endDate: string;
  examStartDate?: string;
  examEndDate?: string;
  vacationStartDate?: string;
  vacationEndDate?: string;
  active: boolean;
}

export interface Enrollment {
  id: number;
  student: Student;
  classe: Classe;
  academicYear: string;
  status: StudentStatus;
  finalGrade?: number;
  enrollmentDate?: string;
}

// ================== USERS & PROFILES ==================

export interface Student {
  id: number;
  user: User;
  studentCode: string;
  birthDate: string;
  gender: Gender;
  nationality?: string;
  classe?: Classe;
  status: StudentStatus;
  bio?: string;
  registrationDate?: string;
}

export interface StudentDTO {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  classeId?: number;
  classeName?: string;
  studentNumber: string;
  birthDate?: string;
  birthPlace?: string;
  bloodGroup?: string;
  medicalInfo?: string;
  bio?: string;
  nationality?: string;
  status: StudentStatus;
}

export interface Teacher {
  id: number;
  user: User;
  teacherCode: string;
  department?: Department;
  hireDate?: string;
  specialties?: string;
  proPhone?: string;
  office?: string;
  cvUrl?: string;
}

export interface TeacherDTO {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  specialties?: string;
  office?: string;
  departmentName?: string;
  cvUrl?: string;
  hireDate?: string;
  teacherCode?: string;
}

// ================== PLANNING & ATTENDANCE ==================

export interface TimeSlot {
  id: number;
  label: string;
  startTime: LocalTime;
  endTime: LocalTime;
  active: boolean;
  pause: boolean;
}

export interface TimeSlotDTO {
  id: number;
  startTime: LocalTime;
  endTime: LocalTime;
  label: string;
  position?: number;
}

export interface Salle {
  id: number;
  nom: string;
  capacite: number;
  type?: string;
  projecteur: boolean;
  ordinateurs: boolean;
  actif: boolean;
}

export interface SalleDTO {
  id: number;
  nom: string;
  batiment?: string;
  capacite: number;
  type?: string;
  projecteur?: boolean;
  ordinateurs?: boolean;
}

export interface PlanningDTO {
  id: number;
  subjectId?: number;
  subjectName?: string;
  teacherId?: number;
  teacherName?: string;
  classeId?: number;
  classeName?: string;
  roomId?: number;
  roomName?: string;
  date: string;
  timeSlotId?: number;
  timeSlotLabel?: string;
  courseType?: CourseType;
  cancelled: boolean;
  cancellationReason?: string;
  rescheduled: boolean;
  originalPlanningId?: number;
  createdAt?: string;
  passed?: boolean;
}

export interface Planning extends PlanningDTO { }

export interface AttendanceDTO {
  id: number;
  studentId: number;
  studentName?: string;
  planningId: number;
  subjectName?: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  justificationReason?: string;
  justificationFileUrl?: string;
  justificationStatus: JustificationStatus;
  validatedByName?: string;
  validatedAt?: string;
}

export interface Attendance extends AttendanceDTO { }

export interface AttendanceRequestDTO {
  studentId: number;
  planningId: number;
  status: AttendanceStatus;
  notes?: string;
}

// ================== EVALUATIONS & RESULTS ==================

export interface Grade {
  id: number;
  student?: Student;
  subject?: Subject;
  teacher?: Teacher;
  evaluationType: EvaluationType;
  score: number;
  maxScore: number;
  weight: number;
  feedback?: string;
  status: EvaluationStatus;
  createdAt?: string;
  publishedAt?: string;
  referenceId?: number;
  weightedScore?: number;
  studentId?: number;
  studentName?: string;
  subjectId?: number;
  subjectName?: string;
}

export interface GradeDTO extends Grade { }

export interface Exam {
  id: number;
  name: string;
  subject?: Subject;
  subjectId?: number;
  subjectName?: string;
  examDate: string;
  examType: string;
  coefficient: number;
  room?: string;
  durationMinutes: number;
  instructions?: string;
}

export interface ExamDTO extends Exam { }

export interface ReportCardDTO {
  id: number;
  studentId: number;
  studentName?: string;
  semesterId: number;
  semesterName?: string;
  academicYear?: string;
  average: number;
  rank: number;
  appreciation?: string;
  validated: boolean;
  createdAt?: string;
  moduleResults?: ModuleResultDTO[];
}

export interface ReportCard extends ReportCardDTO { }

export interface ModuleResultDTO {
  id: number;
  moduleId: number;
  moduleName?: string;
  average: number;
  totalCredits: number;
  subjectResults?: SubjectResultDTO[];
}

export interface SubjectResultDTO {
  id: number;
  subjectId: number;
  subjectName?: string;
  ccAverage: number;
  examGrade: number;
  finalAverage: number;
  teacherAppreciation?: string;
}

// ================== COMMUNICATIONS ==================

export interface MessageDTO {
  id: number;
  senderId: number;
  senderName?: string;
  receiverId: number;
  receiverName?: string;
  subject?: string;
  content: string;
  sentAt: string;
  read: boolean;
  readAt?: string;
}

export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  type?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

// ================== DASHBOARD & STATS ==================

export interface DashboardStatsDTO {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  globalAttendanceRate: number;
  reportCardsGenerated: number;
  databaseStatus?: string;
  serverTime?: string;
  version?: string;
  mode?: string;
}

export interface TeacherDashboardStatsDTO {
  classesCount: number;
  studentsCount: number;
  assignmentsToGrade: number;
  attendanceRate: number;
  adminNote?: string;
  pendingTasks: TeacherTaskDTO[];
}

export interface TeacherTaskDTO {
  title: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  type: 'grading' | 'preparation' | 'meeting' | 'other';
}

// ================== CAHIER DE TEXTE ==================

export interface SeanceCreateDTO {
  date: string;
  heureDebut: LocalTime;
  heureFin: LocalTime;
  cahierDeTexteId: number;
  matiereId: number;
  enseignantId: number;
  objectifs?: string;
  contenuCours?: string;
  devoirs?: string;
  dateLimiteDevoir?: string;
  fichierCloudUrl?: string;
  observations?: string;
  planningId?: number;
  assignmentId?: number;
}

export interface SeanceResponseDTO {
  id: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  matiereId: number;
  matiereNom?: string;
  matiereCode?: string;
  enseignantId: number;
  enseignantNomComplet?: string;
  objectifs?: string;
  contenuCours?: string;
  devoirs?: string;
  dateLimiteDevoir?: string;
  fichierCloudUrl?: string;
  observations?: string;
  planningId?: number;
  assignmentId?: number;
  title?: string;
  description?: string;
  classeName?: string;
  startTime?: string;
  endTime?: string;
}

// ================== TRAVAUX & DEVOIRS ==================

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  subject?: Subject;
  teacher?: Teacher;
  classe?: Classe;
  deadline: string;
  maxNote?: number;
  attachedFileUrl?: string;
  solutionFileUrl?: string;
  published?: boolean;
  createdAt?: string;
  subjectId?: number;
  subjectName?: string;
  teacherId?: number;
  teacherName?: string;
  classeId?: number;
  classeName?: string;
  dueDate?: string;
  maxPoints?: number;
  submissionCount?: number;
}

export interface AssignmentResponseDTO extends Assignment { }

export interface SubmissionResponseDTO {
  id: number;
  assignmentId: number;
  assignmentTitle?: string;
  studentId: number;
  studentName?: string;
  submissionDate: string;
  submittedFileUrl?: string;
  submissionText?: string;
  late: boolean;
  grade?: number;
  feedback?: string;
}

export interface Submission extends SubmissionResponseDTO { }

// ================== RESOURCES ==================

export interface ResourceDTO {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  type: string;
  subjectId: number;
  subjectName?: string;
  teacherId: number;
  teacherName?: string;
  classeId: number;
  classeName?: string;
  published: boolean;
  createdAt: string;
}

export interface Resource extends ResourceDTO { }
