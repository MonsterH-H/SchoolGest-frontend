import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '@core/services/schedule/schedule.service';
import { TimeSlot } from 'app/core/models/time-slot.model';
import { TimeSlotDTO } from 'app/core/models/time-slot.model.dto';
import { TimeslotFormComponent } from '../../components/timeslot-form/timeslot-form.component';

@Component({
  selector: 'app-timeslot-list',
  standalone: true,
  imports: [CommonModule, TimeslotFormComponent],
  templateUrl: './timeslot-list.component.html',
  styleUrls: ['./timeslot-list.component.scss']
})
export class TimeslotListComponent implements OnInit {
  timeSlots: TimeSlotDTO[] = [];
  showForm = false;
  selectedTimeSlot: TimeSlot | null = null;

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.loadTimeSlots();
  }

  loadTimeSlots(): void {
    this.scheduleService.getTimeSlots().subscribe(data => {
      this.timeSlots = data;
    });
  }

  showCreateForm(): void {
    this.selectedTimeSlot = null;
    this.showForm = true;
  }

  showEditForm(timeSlot: TimeSlot): void {
    this.selectedTimeSlot = timeSlot;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.selectedTimeSlot = null;
  }

  saveTimeSlot(timeSlot: TimeSlot): void {
    if (this.selectedTimeSlot && this.selectedTimeSlot.id) {
      this.scheduleService.updateTimeSlot(this.selectedTimeSlot.id, timeSlot).subscribe(() => {
        this.loadTimeSlots();
        this.cancelForm();
      });
    } else {
      this.scheduleService.createTimeSlot(timeSlot).subscribe(() => {
        this.loadTimeSlots();
        this.cancelForm();
      });
    }
  }

  deleteTimeSlot(id: number | undefined): void {
    if (id) {
      this.scheduleService.deleteTimeSlot(id).subscribe(() => {
        this.loadTimeSlots();
      });
    }
  }
}