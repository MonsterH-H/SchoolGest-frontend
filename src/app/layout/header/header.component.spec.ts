import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HeaderComponent } from './header.component';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { SidebarService } from '../../core/services/sidebar.service';

// Fix for TypeScript configuration issues with test matchers
declare const expect: any;

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let sidebarService: SidebarService;
  let router: Router;

  beforeEach(async () => {
    const sidebarServiceSpy = jasmine.createSpyObj('SidebarService', ['toggle']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SidebarService, useValue: sidebarServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    sidebarService = TestBed.inject(SidebarService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar when toggleSidebar is called', () => {
    component.toggleSidebar();
    expect(sidebarService.toggle).toHaveBeenCalled();
  });

  it('should handle search events', () => {
    spyOn(console, 'log');
    const searchTerm = 'test search';

    component.onSearch(searchTerm);

    expect(console.log).toHaveBeenCalledWith('Search term:', searchTerm);
  });

  it('should render header elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Check for main header structure
    expect(compiled.querySelector('header')).toBeTruthy();

    // Check for sidebar toggle button
    expect(compiled.querySelector('button')).toBeTruthy();

    // Check for title
    expect(compiled.querySelector('h1')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Tableau de bord');

    // Check for search bar
    expect(compiled.querySelector('app-search-bar')).toBeTruthy();

    // Check for language selector
    expect(compiled.querySelector('app-language-selector')).toBeTruthy();

    // Check for user menu
    expect(compiled.querySelector('app-user-menu')).toBeTruthy();
  });

  it('should have responsive classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('header');

    expect(header?.classList.contains('h-16')).toBeTruthy();
    expect(header?.classList.contains('md:h-20')).toBeTruthy();
    expect(header?.classList.contains('bg-card')).toBeTruthy();
  });
});
