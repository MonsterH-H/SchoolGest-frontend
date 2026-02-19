
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent {
  @Input() title: string = 'Titre KPI';
  @Input() value: string = '0';
  @Input() icon: string = ''; // Optional icon (e.g., heroicon name)
  @Input() percentageChange?: number;
}
