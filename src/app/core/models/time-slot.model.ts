export interface TimeSlot {
  id?: number;
  label: string;
  startTime: string;
  endTime: string;
  isPause: boolean;
  active: boolean;
}
