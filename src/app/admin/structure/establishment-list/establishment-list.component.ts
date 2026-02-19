import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../../core/services/academic.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Establishment } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-establishment-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './establishment-list.component.html'
})
export class EstablishmentListComponent implements OnInit {
    private academicService = inject(AcademicService);
    private notificationService = inject(NotificationService);

    establishments = signal<Establishment[]>([]);
    isLoading = signal<boolean>(false);
    isModalOpen = signal<boolean>(false);
    isEditModalOpen = signal<boolean>(false);
    editEstablishmentId = signal<number | null>(null);

    newEstablishment: Partial<Establishment> = {
        name: '',
        code: '',
        address: ''
    };

    editEstablishment: Partial<Establishment> = {
        name: '',
        code: '',
        address: ''
    };

    ngOnInit() {
        this.loadEstablishments();
    }

    loadEstablishments() {
        this.isLoading.set(true);
        this.academicService.getEstablishments().pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (data) => this.establishments.set(data),
            error: () => this.notificationService.showError('Erreur de chargement des établissements')
        });
    }

    onSubmit() {
        if (this.newEstablishment.name && this.newEstablishment.code) {
            this.academicService.createEstablishment(this.newEstablishment as Establishment).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Établissement créé');
                    this.closeModal();
                    this.loadEstablishments();
                },
                error: () => this.notificationService.showError('Erreur lors de la création')
            });
        }
    }

    openEditModal(establishment: Establishment) {
        this.editEstablishmentId.set(establishment.id ?? null);
        this.editEstablishment = {
            name: establishment.name,
            code: establishment.code,
            address: establishment.address
        };
        this.isEditModalOpen.set(true);
    }

    closeEditModal() {
        this.isEditModalOpen.set(false);
        this.editEstablishmentId.set(null);
        this.editEstablishment = { name: '', code: '', address: '' };
    }

    onUpdate() {
        const id = this.editEstablishmentId();
        if (!id) return;
        if (!this.editEstablishment.name || !this.editEstablishment.code) return;

        this.academicService.updateEstablishment(id, this.editEstablishment).subscribe({
            next: () => {
                this.notificationService.showSuccess('Établissement mis à jour');
                this.closeEditModal();
                this.loadEstablishments();
            },
            error: () => this.notificationService.showError('Erreur lors de la mise à jour')
        });
    }

    deleteEstablishment(id: number | null | undefined) {
        if (typeof id !== 'number') return;
        if (!confirm('Supprimer cet établissement ?')) return;
        this.academicService.deleteEstablishment(id).subscribe({
            next: () => {
                this.notificationService.showSuccess('Établissement supprimé');
                this.establishments.update(prev => prev.filter(e => e.id !== id));
            },
            error: () => this.notificationService.showError('Erreur lors de la suppression')
        });
    }

    openAddModal() {
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.newEstablishment = { name: '', code: '', address: '' };
    }
}
