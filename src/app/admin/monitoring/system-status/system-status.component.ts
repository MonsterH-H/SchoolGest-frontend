import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DashboardStatsDTO } from '../../../shared/models/api-schemas';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-system-status',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './system-status.component.html'
})
export class SystemStatusComponent implements OnInit {
    private adminService = inject(AdminService);
    private notificationService = inject(NotificationService);

    status = signal<DashboardStatsDTO | null>(null);
    isLoading = signal<boolean>(false);
    isImporting = signal<boolean>(false);
    isExporting = signal<boolean>(false);
    currentTime = new Date().toLocaleTimeString();

    ngOnInit() {
        this.loadStatus();
    }

    loadStatus() {
        this.isLoading.set(true);
        this.adminService.getSystemStatus().pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (data) => this.status.set(data),
            error: () => this.notificationService.showError('Erreur de chargement du statut système')
        });
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.importUsers(file);
        }
    }

    importUsers(file: File) {
        this.isImporting.set(true);
        this.adminService.importUsers(file).pipe(
            finalize(() => this.isImporting.set(false))
        ).subscribe({
            next: () => {
                this.notificationService.showSuccess('Importation réussie');
                this.loadStatus();
            },
            error: (err) => this.notificationService.showError('Échec de l\'importation: ' + err.message)
        });
    }

    exportUsers() {
        this.isExporting.set(true);
        this.adminService.exportUsers().pipe(
            finalize(() => this.isExporting.set(false))
        ).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `users_export_${new Date().getTime()}.csv`;
                a.click();
                this.notificationService.showSuccess('Exportation terminée');
            },
            error: () => this.notificationService.showError('Échec de l\'exportation')
        });
    }
}
