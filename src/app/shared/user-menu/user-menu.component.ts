import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs'; // Import Subscription
import { AuthService } from '../../core/services/auth.service';
import { User, Role } from '../models/api-schemas';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent implements OnInit, OnDestroy { // Implement OnInit, OnDestroy
  user: User | null = null; // Add user property
  currentUser$: Observable<User | null>;
  private userSubscription!: Subscription; // To manage subscription

  // Controls visibility of the dropdown menu
  isUserMenuOpen = false;

  // Role-based properties
  userRole: string = '';
  isTeacher: boolean = false;
  isStudent: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.userSubscription = this.currentUser$.subscribe(user => {
      this.user = user; // Assign observable value to user property
      this.updateRoleBasedProperties();
    });
  }

  private updateRoleBasedProperties(): void {
    if (this.user?.role) {
      this.userRole = this.user.role;
      this.isTeacher = this.user.role === Role.ENSEIGNANT;
      this.isStudent = this.user.role === Role.ETUDIANT;
      this.isAdmin = this.user.role === Role.ADMIN;
    } else {
      this.userRole = '';
      this.isTeacher = false;
      this.isStudent = false;
      this.isAdmin = false;
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}