import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import {
  Establishment,
  Module,
  Subject,
  Classe,
  Semester,
  Salle,
  SalleDTO,
  SubjectDTO,
  ModuleDTO,
  StudentDTO,
  ClasseDTO
} from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class AcademicService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // --- Establishments ---
  getEstablishments(): Observable<Establishment[]> {
    return this.http.get<Establishment[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.ESTABLISHMENTS}`);
  }

  createEstablishment(establishment: Establishment): Observable<Establishment> {
    return this.http.post<Establishment>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.ESTABLISHMENTS}`, establishment);
  }

  updateEstablishment(id: number, establishment: Partial<Establishment>): Observable<Establishment> {
    return this.http.put<Establishment>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.ESTABLISHMENT_BY_ID(id)}`, establishment);
  }

  deleteEstablishment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.ESTABLISHMENT_BY_ID(id)}`);
  }

  // --- Modules ---
  getModules(): Observable<ModuleDTO[]> {
    return this.http.get<ModuleDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.MODULES}`);
  }

  getModulesByClasse(classeId: number | string): Observable<ModuleDTO[]> {
    return this.http.get<ModuleDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.MODULES_BY_CLASSE(classeId)}`);
  }

  createModule(module: Module): Observable<ModuleDTO> {
    return this.http.post<ModuleDTO>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.MODULES}`, module);
  }

  updateModule(id: number, dto: Partial<ModuleDTO>): Observable<ModuleDTO> {
    return this.http.put<ModuleDTO>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.MODULE_BY_ID(id)}`, dto);
  }

  deleteModule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.MODULES}/${id}`);
  }

  // --- Subjects ---
  getSubjects(): Observable<SubjectDTO[]> {
    return this.http.get<SubjectDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SUBJECTS}`);
  }

  getSubjectsByClasse(classeId: number | string): Observable<SubjectDTO[]> {
    return this.http.get<SubjectDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SUBJECTS_BY_CLASSE(classeId)}`);
  }

  getSubjectsByModule(moduleId: number | string): Observable<SubjectDTO[]> {
    return this.http.get<SubjectDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SUBJECTS_BY_MODULE(moduleId)}`);
  }

  createSubject(subject: Subject): Observable<SubjectDTO> {
    return this.http.post<SubjectDTO>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SUBJECTS}`, subject);
  }

  updateSubject(id: number, dto: Partial<SubjectDTO>): Observable<SubjectDTO> {
    return this.http.put<SubjectDTO>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SUBJECT_BY_ID(id)}`, dto);
  }

  assignSubjectToModule(subjectId: number, moduleId: number): Observable<SubjectDTO> {
    const params = new HttpParams().set('moduleId', moduleId.toString());
    return this.http.put<SubjectDTO>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SUBJECT_MODULE(subjectId)}`, null, { params });
  }

  unassignSubjectFromModule(subjectId: number): Observable<SubjectDTO> {
    return this.http.delete<SubjectDTO>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SUBJECT_MODULE(subjectId)}`);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SUBJECTS}/${id}`);
  }

  // --- Classes ---
  getClasses(): Observable<ClasseDTO[]> {
    return this.http.get<ClasseDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.CLASSES}`);
  }

  createClasse(classe: Classe): Observable<ClasseDTO> {
    return this.http.post<ClasseDTO>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.CLASSES}`, classe);
  }

  updateClasse(id: number, classe: Partial<Classe>): Observable<ClasseDTO> {
    return this.http.put<ClasseDTO>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.CLASSE_BY_ID(id)}`, classe);
  }

  deleteClasse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.CLASSES}/${id}`);
  }

  getStudentsByClasse(id: number | string): Observable<StudentDTO[]> {
    return this.http.get<StudentDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.STUDENTS_BY_CLASSE(id)}`);
  }

  // --- Semesters ---
  getSemesters(): Observable<Semester[]> {
    return this.http.get<Semester[]>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SEMESTERS}`);
  }

  createSemester(semester: Semester): Observable<Semester> {
    return this.http.post<Semester>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SEMESTERS}`, semester);
  }

  updateSemester(id: number, semester: Partial<Semester>): Observable<Semester> {
    return this.http.put<Semester>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SEMESTER_BY_ID(id)}`, semester);
  }

  deleteSemester(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.SEMESTER_BY_ID(id)}`);
  }

  // --- Rooms (Salles) ---
  getSalles(): Observable<SalleDTO[]> {
    return this.http.get<SalleDTO[]>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.SALLES}`);
  }

  createSalle(salle: Salle): Observable<SalleDTO> {
    return this.http.post<SalleDTO>(`${this.baseUrl}/${API_ENDPOINTS.SCHEDULE.SALLES}`, salle);
  }

  // --- Enrollment ---
  enrollStudent(studentId: number, classeId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.ENROLL}`, {}, {
      params: { studentId: studentId.toString(), classeId: classeId.toString() }
    });
  }

  unenrollStudent(studentId: number, classeId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${API_ENDPOINTS.STRUCTURE.ENROLL}`, {
      params: { studentId: studentId.toString(), classeId: classeId.toString() }
    });
  }
}
