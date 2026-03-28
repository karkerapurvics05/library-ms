import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User, ApiResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { name: string; email: string; password: string; role?: string }) {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, data).pipe(
      tap(res => { if (res.success) this.saveSession(res); })
    );
  }

  login(data: { email: string; password: string }) {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/login`, data).pipe(
      tap(res => { if (res.success) this.saveSession(res); })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private saveSession(res: ApiResponse<User>) {
    if (res.token) localStorage.setItem('token', res.token);
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
      this.currentUser.set(res.user);
    }
  }

  private getUserFromStorage(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
}
