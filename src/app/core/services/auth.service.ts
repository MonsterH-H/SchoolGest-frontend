import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, map } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api-endpoints';
import {
  AuthResponseDTO,
  LoginRequest,
  RegisterRequest,
  UserResponseDTO,
  Role
} from '../../shared/models/api-schemas';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  private http = inject(HttpClient);
  private router = inject(Router);

  // Observable states
  private _currentUser = new BehaviorSubject<UserResponseDTO | null>(null);
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _userRole = new BehaviorSubject<Role | null>(null);

  // Public observables
  currentUser$ = this._currentUser.asObservable();
  isAuthenticated$ = this._isAuthenticated.asObservable();
  userRole$ = this._userRole.asObservable();

  // Storage keys
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'user_data';
  private readonly ROLE_KEY = 'user_role';

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this._updateStateWithUser(user);
        } catch (e) {
          // Corrupt data, fetch from server
          this.getMe().subscribe({ error: () => this.logout() });
        }
      } else {
        // No user data, but valid token. Fetch from server.
        this.getMe().subscribe({ error: () => this.logout() });
      }
    } else {
      this.clearAuthData();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.LOGIN}`, credentials).pipe(
      tap((response: AuthResponseDTO) => {
        this.handleAuthResponse(response);
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  register(userData: RegisterRequest | FormData): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.REGISTER}`, userData).pipe(
      tap(response => {
        if (response && response.accessToken) {
          this.handleAuthResponse(response);
        }
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  updateProfile(data: any | FormData): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.PROFILE}`, data).pipe(
      tap(user => {
        if (user) {
          this._currentUser.next(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): UserResponseDTO | null {
    return this._currentUser.value;
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated.value;
  }

  getUserRole(): Role | null {
    return this._userRole.value;
  }

  hasRole(role: Role): boolean {
    return this._userRole.value === role;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  private _updateStateWithUser(user: UserResponseDTO): void {
    if (!user || !user.role) {
      this.logout();
      return;
    }

    // Normalize role
    let roleStr = (user.role as string).startsWith('ROLE_')
      ? (user.role as string).substring(5)
      : (user.role as string);
    user.role = roleStr as Role;

    this._currentUser.next(user);
    this._isAuthenticated.next(true);
    this._userRole.next(user.role);

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.ROLE_KEY, user.role);
  }

  private handleAuthResponse(response: AuthResponseDTO): void {
    console.log('AuthService - Handling Auth Response:', response);

    if (!response || !response.user) {
      console.error('AuthService - Invalid Auth Response: missing user object');
      this.logout(); // Logout on invalid response
      return;
    }

    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    }

    this._updateStateWithUser(response.user);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, { email }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, data).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.VERIFY_EMAIL}`, { email, code }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  refreshToken(token: string): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.REFRESH}`, { refreshToken: token }).pipe(
      tap((response: AuthResponseDTO) => {
        this.handleAuthResponse(response);
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`, data).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  getMe(): Observable<UserResponseDTO> {
    return this.http.get<any>(`${environment.apiUrl}/${API_ENDPOINTS.AUTH.ME}`).pipe(
      map(response => {
        if (response.profile) {
          const user = response.profile;
          if (response.academicDetails) {
            user.academicDetails = response.academicDetails;
          }
          return user;
        }
        return response as UserResponseDTO;
      }),
      tap(user => {
        this._updateStateWithUser(user); // Centralized state update
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
    this._userRole.next(null);
  }

  private handleAuthError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de l\'authentification.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
