import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service'; // Added import for NotificationService
import { finalize } from 'rxjs/operators';
import { DashboardStatsDTO } from '../../shared/models/api-schemas';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface KpiCard {
  title: string;
  value: string | number;
  iconPath: string;
  description: string;
  trend?: string;
  trendPositive?: boolean;
  colorClasses: {
    bg: string;
    icon: string;
    text: string;
  };
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService); // Changed to private

  isLoading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);
  stats = signal<DashboardStatsDTO | null>(null);
  kpiCards = signal<KpiCard[]>([]);

  // Chart data for local distribution (classes vs rate or similar)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      }
    },
    scales: {
      y: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    datasets: [
      {
        data: [85, 92, 78, 88, 95],
        label: '% Présence',
        backgroundColor: '#4f46e5',
        borderRadius: 8,
        hoverBackgroundColor: '#4338ca'
      }
    ]
  };

  public donutChartData: ChartData<'doughnut'> = {
    labels: ['Admin', 'Enseignants', 'Étudiants'],
    datasets: [
      {
        data: [5, 45, 250],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  public donutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, color: '#64748b' } }
    },
    cutout: '70%',
  };

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.errorMsg.set(null);

    this.adminService.getStats().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.updateKpis(data);
        this.updateCharts(data);
      },
      error: (err) => {
        console.error('Failed to load admin stats', err);
        this.errorMsg.set('Impossible de récupérer les statistiques en temps réel. Vérifiez votre connexion au serveur.');
      }
    });
  }

  private updateKpis(data: DashboardStatsDTO) {
    this.kpiCards.set([
      {
        title: 'Étudiants',
        value: data.totalStudents || 0,
        iconPath: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
        description: 'Inscrits cette année',
        trend: '+12%', trendPositive: true,
        colorClasses: { bg: 'bg-indigo-50', icon: 'text-indigo-600', text: 'text-indigo-900' }
      },
      {
        title: 'Enseignants',
        value: data.totalTeachers || 0,
        iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        description: 'Corps professoral actif',
        trend: '+2', trendPositive: true,
        colorClasses: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-900' }
      },
      {
        title: 'Classes',
        value: data.totalClasses || 0,
        iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        description: 'Groupes pédagogiques',
        colorClasses: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-900' }
      },
      {
        title: 'Présence',
        value: (data.globalAttendanceRate || 0).toFixed(1) + '%',
        iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
        description: 'Taux moyen de présence',
        trend: '-0.5%', trendPositive: false,
        colorClasses: { bg: 'bg-rose-50', icon: 'text-rose-600', text: 'text-rose-900' }
      }
    ]);
  }

  private updateCharts(data: DashboardStatsDTO) {
    this.donutChartData.datasets[0].data = [
      1,
      data.totalTeachers || 0,
      data.totalStudents || 0
    ];
  }

  // --- REPORT CARDS ACTIONS ---
  onCalculateRanks(semesterId: number): void {
    this.adminService.calculateRanks(semesterId).subscribe({
      next: () => this.notificationService.showSuccess('Calcul des rangs terminé'),
      error: () => this.notificationService.showError('Erreur lors du calcul des rangs')
    });
  }

  onGenerateBulletins(semesterId: number): void {
    this.adminService.generateReportCards(semesterId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Bulletins générés avec succès');
        this.loadStats();
      },
      error: () => this.notificationService.showError('Échec de la génération des bulletins')
    });
  }
}
