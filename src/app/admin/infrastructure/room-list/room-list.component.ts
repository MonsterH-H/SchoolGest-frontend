import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService } from '../../../core/services/academic.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SalleDTO, Salle } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-room-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './room-list.component.html'
})
export class RoomListComponent implements OnInit {
    private academicService = inject(AcademicService);
    private notificationService = inject(NotificationService);

    rooms = signal<SalleDTO[]>([]);
    isLoading = signal<boolean>(false);
    showAddModal = signal<boolean>(false);

    newRoom: Partial<Salle> = {
        nom: '',
        capacite: 30,
        projecteur: true,
        ordinateurs: false,
        actif: true
    };

    ngOnInit(): void {
        this.loadRooms();
    }

    loadRooms(): void {
        this.isLoading.set(true);
        this.academicService.getSalles()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data: SalleDTO[]) => this.rooms.set(data),
                error: () => this.notificationService.showError('Erreur chargement des salles')
            });
    }

    onCreateRoom(): void {
        if (!this.newRoom.nom) return;
        this.academicService.createSalle(this.newRoom as Salle).subscribe({
            next: (created: SalleDTO) => {
                this.loadRooms();
                this.notificationService.showSuccess(`Salle ${created.nom} ajoutée`);
                this.showAddModal.set(false);
                this.resetForm();
            },
            error: () => this.notificationService.showError('Erreur création')
        });
    }

    private resetForm() {
        this.newRoom = { nom: '', capacite: 30, projecteur: true, ordinateurs: false, actif: true };
    }
}

// I noticed AcademicService should have Room methods. Let me check and fix it.
