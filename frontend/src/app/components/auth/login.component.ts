import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">📚</div>
          <h1>Library System</h1>
          <p>Sign in to your account</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="credentials.email" name="email"
              required placeholder="you@example.com" class="form-control" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="credentials.password" name="password"
              required placeholder="••••••••" class="form-control" />
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }
    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .logo { font-size: 3rem; margin-bottom: 0.5rem; }
    .auth-header h1 { font-size: 1.8rem; color: #1a1a2e; margin: 0; font-weight: 700; }
    .auth-header p { color: #666; margin: 0.25rem 0 0; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 0.4rem; font-size: 0.9rem; }
    .form-control {
      width: 100%; padding: 0.75rem 1rem; border: 2px solid #e0e0e0;
      border-radius: 8px; font-size: 1rem; transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-control:focus { outline: none; border-color: #0f3460; }
    .btn-primary {
      width: 100%; padding: 0.85rem; background: #0f3460;
      color: white; border: none; border-radius: 8px; font-size: 1rem;
      font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem;
    }
    .btn-primary:hover:not(:disabled) { background: #1a1a2e; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .error-msg { background: #fee; border: 1px solid #fcc; color: #c00; padding: 0.6rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
    .auth-footer { text-align: center; margin-top: 1.5rem; color: #666; font-size: 0.9rem; }
    .auth-footer a { color: #0f3460; font-weight: 600; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
