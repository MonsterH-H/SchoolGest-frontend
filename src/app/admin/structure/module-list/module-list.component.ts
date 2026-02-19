import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../../core/services/academic.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ClasseDTO, ModuleDTO, Module, Semester } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-module-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './module-list.component.html'
})
export class ModuleListComponent implements OnInit {
    private academicService = inject(AcademicService);
    private notificationService = inject(NotificationService);

    modules = signal<ModuleDTO[]>([]);
    classes = signal<ClasseDTO[]>([]);
    semesters = signal<Semester[]>([]);
    isLoading = signal<boolean>(false);
    showAddModal = signal<boolean>(false);
    showEditModal = signal<boolean>(false);

    newModule: Partial<Module> = {
        name: '',
        credits: 6
    };

    newModuleClasseId: number | null = null;
    newModuleSemesterId: number | null = null;

    editModuleId = signal<number | null>(null);
    editModule: Partial<ModuleDTO> = {};

    ngOnInit(): void {
        this.loadModules();
        this.loadClasses();
        this.loadSemesters();
    }

    loadModules(): void {
        this.isLoading.set(true);
        this.academicService.getModules()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => this.modules.set(data),
                error: () => this.notificationService.showError('Erreur chargement des modules')
            });
    }

    loadClasses(): void {
        this.academicService.getClasses().subscribe({
            next: (data) => this.classes.set(data),
            error: () => this.notificationService.showError('Erreur chargement des classes')
        });
    }

    loadSemesters(): void {
        this.academicService.getSemesters().subscribe({
            next: (data) => this.semesters.set(data),
            error: () => this.notificationService.showError('Erreur chargement des semestres')
        });
    }

    onCreateModule(): void {
        if (!this.newModule.name) return;

        this.academicService.createModule(this.newModule as Module).subscribe({
            next: (created) => {
                const needsAssign = !!this.newModuleClasseId || !!this.newModuleSemesterId;
                if (needsAssign) {
                    this.academicService.updateModule(created.id, {
                        classeId: this.newModuleClasseId ?? undefined,
                        semesterId: this.newModuleSemesterId ?? undefined
                    }).subscribe({
                        next: () => {
                            this.loadModules();
                            this.notificationService.showSuccess(`Module ${created.name} créé`);
                            this.showAddModal.set(false);
                            this.resetCreateForm();
                        },
                        error: () => this.notificationService.showError('Erreur affectation (classe/semestre)')
                    });
                    return;
                }

                this.loadModules();
                this.notificationService.showSuccess(`Module ${created.name} créé`);
                this.showAddModal.set(false);
                this.resetCreateForm();
            },
            error: () => this.notificationService.showError('Erreur création')
        });
    }

    openEditModal(mod: ModuleDTO): void {
        this.editModuleId.set(mod.id);
        this.editModule = {
            name: mod.name,
            credits: mod.credits,
            classeId: mod.classeId,
            semesterId: mod.semesterId
        };
        this.showEditModal.set(true);
    }

    onUpdateModule(): void {
        const id = this.editModuleId();
        if (!id) return;
        if (!this.editModule.name) return;

        this.academicService.updateModule(id, this.editModule).subscribe({
            next: () => {
                this.notificationService.showSuccess('Module mis à jour');
                this.showEditModal.set(false);
                this.editModuleId.set(null);
                this.editModule = {};
                this.loadModules();
            },
            error: () => this.notificationService.showError('Erreur mise à jour')
        });
    }

    deleteModule(id: number): void {
        if (confirm('Supprimer ce module ?')) {
            this.academicService.deleteModule(id).subscribe({
                next: () => {
                    this.modules.update(prev => prev.filter(m => m.id !== id));
                    this.notificationService.showSuccess('Module supprimé');
                },
                error: () => this.notificationService.showError('Erreur suppression')
            });
        }
    }

    private resetCreateForm(): void {
        this.newModule = { name: '', credits: 6 };
        this.newModuleClasseId = null;
        this.newModuleSemesterId = null;
    }
}
