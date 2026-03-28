import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">📚</div>
          <h1>Create Account</h1>
          <p>Join the Library Management System</p>
        </div>

        <form (ngSubmit)="onRegister()" #regForm="ngForm">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="formData.name" name="name"
              required placeholder="John Doe" class="form-control" />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="formData.email" name="email"
              required placeholder="you@example.com" class="form-control" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="formData.password" name="password"
              required minlength="6" placeholder="Min. 6 characters" class="form-control" />
          </div>
          <div class="form-group">
            <label>Account Type</label>
            <select [(ngModel)]="formData.role" name="role" class="form-control">
              <option value="user">Member (User)</option>
              <option value="admin">Librarian (Admin)</option>
            </select>
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>
          <div class="success-msg" *ngIf="success">{{ success }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/auth/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }
    .auth-card {
      background: white; border-radius: 16px; padding: 2.5rem;
      width: 100%; max-width: 420px; box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .logo { font-size: 3rem; margin-bottom: 0.5rem; }
    .auth-header h1 { font-size: 1.8rem; color: #1a1a2e; margin: 0; font-weight: 700; }
    .auth-header p { color: #666; margin: 0.25rem 0 0; }
    .form-group { margin-bottom: 1.1rem; }
    .form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 0.4rem; font-size: 0.9rem; }
    .form-control {
      width: 100%; padding: 0.75rem 1rem; border: 2px solid #e0e0e0;
      border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box;
    }
    .form-control:focus { outline: none; border-color: #0f3460; }
    .btn-primary {
      width: 100%; padding: 0.85rem; background: #0f3460; color: white;
      border: none; border-radius: 8px; font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s; margin-top: 0.5rem;
    }
    .btn-primary:hover:not(:disabled) { background: #1a1a2e; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .error-msg { background: #fee; border: 1px solid #fcc; color: #c00; padding: 0.6rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
    .success-msg { background: #efe; border: 1px solid #cfc; color: #060; padding: 0.6rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
    .auth-footer { text-align: center; margin-top: 1.5rem; color: #666; font-size: 0.9rem; }
    .auth-footer a { color: #0f3460; font-weight: 600; text-decoration: none; }
  `]
})
export class RegisterComponent {
  formData = { name: '', email: '', password: '', role: 'user' };
  loading = false;
  error = '';
  success = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.loading = true;
    this.error = '';
    this.authService.register(this.formData).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting...';
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed.';
        this.loading = false;
      }
    });
  }
}
