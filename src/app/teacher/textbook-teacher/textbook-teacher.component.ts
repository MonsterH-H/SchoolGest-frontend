import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CahierTexteService } from '../../core/services/cahier-texte.service';
import { AcademicService } from '../../core/services/academic.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ClasseDTO, SubjectDTO, SeanceResponseDTO, SeanceCreateDTO, LocalTime } from '../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-textbook-teacher',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './textbook-teacher.component.html'
})
export class TextbookTeacherComponent implements OnInit {
    private cahierService = inject(CahierTexteService);
    private academicService = inject(AcademicService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    classes = signal<ClasseDTO[]>([]);
    subjects = signal<SubjectDTO[]>([]);
    seances = signal<SeanceResponseDTO[]>([]);

    isLoading = signal<boolean>(false);
    isSaving = signal<boolean>(false);
    showModal = signal<boolean>(false);

    seanceForm: FormGroup;

    constructor() {
        this.seanceForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            date: [new Date().toISOString().split('T')[0], Validators.required],
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            subjectId: [null, Validators.required],
            classeId: [null, Validators.required],
            homework: [''],
            homeworkDueDate: ['']
        });
    }

    ngOnInit() {
        this.loadClasses();
        this.loadSubjects();
        this.loadMySeances();
    }

    loadClasses() {
        this.academicService.getClasses().subscribe({
            next: (data: ClasseDTO[]) => this.classes.set(data)
        });
    }

    loadSubjects() {
        // Charger toutes les matières disponibles au départ
        this.academicService.getSubjects().subscribe({
            next: (data: SubjectDTO[]) => this.subjects.set(data),
            error: () => this.notificationService.showError('Erreur lors du chargement des matières')
        });
    }

    loadMySeances() {
        const user = this.authService.getCurrentUser();
        const teacherId = user?.academicDetails?.id;
        if (teacherId) {
            this.isLoading.set(true);
            this.cahierService.getByTeacher(teacherId)
                .pipe(finalize(() => this.isLoading.set(false)))
                .subscribe({
                    next: (data: SeanceResponseDTO[]) => this.seances.set(data),
                    error: () => this.notificationService.showError('Erreur lors du chargement des séances')
                });
        }
    }

    openAddModal() {
        this.seanceForm.reset({
            date: new Date().toISOString().split('T')[0],
            subjectId: null,
            classeId: null
        });
        // Les matières sont maintenant chargées au départ, pas besoin de les réinitialiser
        this.showModal.set(true);
    }

    onClasseChange(classeId: number | null) {
        if (!classeId) {
            // Recharger toutes les matières si aucune classe n'est sélectionnée
            this.loadSubjects();
            this.seanceForm.patchValue({ subjectId: null });
            return;
        }

        // Filtrer les matières par classe depuis les matières déjà chargées
        this.academicService.getSubjectsByClasse(classeId).subscribe({
            next: (data) => this.subjects.set(data),
            error: () => {
                // En cas d'erreur, garder toutes les matières
                this.loadSubjects();
                this.notificationService.showError('Erreur lors du filtrage des matières, affichage de toutes les matières disponibles');
            }
        });
    }

    onSubmit() {
        if (this.seanceForm.invalid) {
            this.notificationService.showError('Veuillez remplir tous les champs requis');
            return;
        }

        this.isSaving.set(true);
        const user = this.authService.getCurrentUser();
        const teacherId = user?.academicDetails?.id;

        if (!teacherId) {
            this.notificationService.showError('Enseignant non identifié');
            this.isSaving.set(false);
            return;
        }

        const formValue = this.seanceForm.value;

        // Validation des champs critiques
        if (!formValue.classeId || !formValue.subjectId || !formValue.startTime || !formValue.endTime) {
            this.notificationService.showError('Classe, matière, heure de début et heure de fin sont obligatoires');
            this.isSaving.set(false);
            return;
        }

        const parseTime = (timeStr: string): LocalTime => {
            if (!timeStr || !timeStr.includes(':')) {
                throw new Error('Format d\'heure invalide');
            }
            const [hour, minute] = timeStr.split(':').map(Number);
            if (isNaN(hour) || isNaN(minute)) {
                throw new Error('Heure contient des valeurs non numériques');
            }
            return { hour, minute, second: 0, nano: 0 };
        };

        try {
            const seanceData: SeanceCreateDTO = {
                date: formValue.date,
                heureDebut: parseTime(formValue.startTime),
                heureFin: parseTime(formValue.endTime),
                matiereId: formValue.subjectId,
                enseignantId: teacherId,
                objectifs: formValue.title || '',
                contenuCours: formValue.description || '',
                devoirs: formValue.homework || null,
                dateLimiteDevoir: formValue.homeworkDueDate || null,
                cahierDeTexteId: formValue.classeId // Le backend gère maintenant la conversion classe -> cahier de texte
            };

            console.log('Données du formulaire:', formValue);
            console.log('ID enseignant:', teacherId);
            console.log('Données de séance à envoyer:', seanceData);

            this.cahierService.createSeance(seanceData)
                .pipe(finalize(() => this.isSaving.set(false)))
                .subscribe({
                    next: (response) => {
                        console.log('Réponse de succès:', response);
                        this.notificationService.showSuccess('Séance ajoutée au cahier de texte');
                        this.showModal.set(false);
                        this.loadMySeances();
                    },
                    error: (error) => {
                        console.error('Réponse d\'erreur:', error);
                        console.error('Détails de l\'erreur:', error.error);
                        let errorMessage = 'Échec de l\'ajout de la séance';
                        if (error.error?.message) {
                            errorMessage += ': ' + error.error.message;
                        } else if (error.message) {
                            errorMessage += ': ' + error.message;
                        }
                        this.notificationService.showError(errorMessage);
                    }
                });
        } catch (error) {
            console.error('Erreur de parsing:', error);
            this.notificationService.showError('Erreur lors de la préparation des données: ' + (error as Error).message);
            this.isSaving.set(false);
        }
    }
}
