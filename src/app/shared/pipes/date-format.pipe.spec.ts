import { DateFormatPipe } from './date-format.pipe';
import { DatePipe } from '@angular/common';

// Fix for TypeScript configuration issues with test matchers
declare const expect: any;

describe('DateFormatPipe', () => {
  it('create an instance', () => {
    const datePipe = new DatePipe('en-US');
    const pipe = new DateFormatPipe(datePipe);
    expect(pipe).toBeDefined();
  });
});
