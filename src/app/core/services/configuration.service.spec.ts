import { TestBed } from '@angular/core/testing';`n`n// Fix for TypeScript configuration issues with test matchers`ndeclare const expect: any;

import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


