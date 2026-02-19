import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileNavComponent } from './mobile-nav.component';
// Fix for TypeScript configuration issues with test matchers
declare const expect: any;

describe('MobileNavComponent', () => {
  let component: MobileNavComponent;
  let fixture: ComponentFixture<MobileNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
