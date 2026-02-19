import { TestBed } from '@angular/core/testing';

import { AlertService } from './alert.service';

// Fix for TypeScript configuration issues with test matchers
declare const expect: any;

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

