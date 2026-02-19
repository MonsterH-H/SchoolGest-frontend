import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AcademicService } from '../../../core/services/academic.service';
import { ReportCardService } from '../../../core/services/report-card.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Semester, ReportCardDTO } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-bulletin-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './bulletin-admin.component.html'
})
export class BulletinAdminComponent implements OnInit {
    private adminService = inject(AdminService);
    private academicService = inject(AcademicService);
    private reportCardService = inject(ReportCardService);
    private notificationService = inject(NotificationService);

    semesters = signal<Semester[]>([]);
    selectedSemesterId = signal<number | null>(null);
    isLoading = signal<boolean>(false);
    isGenerating = signal<boolean>(false);

    ngOnInit() {
        this.loadSemesters();
    }

    loadSemesters() {
        this.academicService.getSemesters().subscribe(data => this.semesters.set(data));
    }

    onGenerate() {
        if (!this.selectedSemesterId()) return;
        this.isGenerating.set(true);
        this.adminService.generateReportCards(this.selectedSemesterId()!).pipe(
            finalize(() => this.isGenerating.set(false))
        ).subscribe({
            next: () => this.notificationService.showSuccess('Bulletins générés avec succès'),
            error: () => this.notificationService.showError('Échec de la génération')
        });
    }

    onCalculateRanks() {
        if (!this.selectedSemesterId()) return;
        this.isGenerating.set(true);
        this.adminService.calculateRanks(this.selectedSemesterId()!).pipe(
            finalize(() => this.isGenerating.set(false))
        ).subscribe({
            next: () => this.notificationService.showSuccess('Calcul des rangs terminé'),
            error: () => this.notificationService.showError('Échec du calcul des rangs')
        });
    }
}
