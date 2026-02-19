import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common'; // Import DatePipe from @angular/common

@Pipe({
  name: 'dateFormat',
  standalone: true // Make it standalone if it's not already in a module
})
export class DateFormatPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {} // Inject DatePipe

  transform(value: Date | string | null | undefined, format: string = 'mediumDate'): string | null {
    if (!value) {
      return null;
    }
    // Use Angular's built-in DatePipe for robust formatting
    return this.datePipe.transform(value, format);
  }
}
