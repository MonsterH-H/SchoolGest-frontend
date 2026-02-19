import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TimeSlot } from 'app/core/models/time-slot.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeslot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './timeslot-form.component.html',
  styleUrls: ['./timeslot-form.component.scss']
})
export class TimeslotFormComponent implements OnInit {
  @Input() timeSlot: TimeSlot | null = null;
  @Output() save = new EventEmitter<TimeSlot>();
  @Output() cancel = new EventEmitter<void>();

  timeSlotForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.timeSlotForm = this.fb.group({
      label: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isPause: [false],
      active: [true]
    });
  }

  ngOnInit(): void {
    if (this.timeSlot) {
      this.timeSlotForm.patchValue(this.timeSlot);
    }
  }

  onSubmit(): void {
    if (this.timeSlotForm.valid) {
      this.save.emit(this.timeSlotForm.value);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
