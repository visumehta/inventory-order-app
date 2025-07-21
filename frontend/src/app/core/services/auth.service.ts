import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, AuthResponse } from '../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Backend API URL
  private currentUserSubject: BehaviorSubject<AuthResponse | null>;
  public currentUser: Observable<AuthResponse | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): AuthResponse | null {
    const currentUser = this.currentUserSubject.value;
    console.log('AuthService: currentUserValue accessed', currentUser);
    return currentUser;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const currentUser = this.currentUserValue;
    return currentUser && currentUser.token ? currentUser.token : null;
  }

  getRefreshToken(): string | null {
    const currentUser = this.currentUserValue;
    return currentUser && currentUser.refreshToken ? currentUser.refreshToken : null;
  }

  getUserRole(): string | null {
    const currentUser = this.currentUserValue;
    return currentUser && currentUser.role ? currentUser.role : null;
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/token`, { refreshToken })
      .pipe(
        tap(response => {
          const currentUser = this.currentUserValue;
          if (currentUser) {
            currentUser.token = response.token;
            currentUser.refreshToken = response.refreshToken;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            this.currentUserSubject.next(currentUser);
          }
        })
      );
  }
}
