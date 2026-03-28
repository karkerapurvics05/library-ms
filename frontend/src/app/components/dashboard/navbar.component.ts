import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="nav-icon">📚</span>
        <span>LibraryMS</span>
      </div>
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/books" routerLinkActive="active">Books</a>
        <a routerLink="/borrow" routerLinkActive="active">My Borrows</a>
        <a *ngIf="auth.isAdmin()" routerLink="/books/add" routerLinkActive="active">Add Book</a>
        <a *ngIf="auth.isAdmin()" routerLink="/admin/borrows" routerLinkActive="active">All Borrows</a>
      </div>
      <div class="nav-user">
        <span class="user-badge" [class.admin]="auth.isAdmin()">
          {{ auth.isAdmin() ? '🔑 Admin' : '👤 User' }}
        </span>
        <span class="user-name">{{ auth.currentUser()?.name }}</span>
        <button class="btn-logout" (click)="auth.logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: #1a1a2e; color: white; height: 64px;
      display: flex; align-items: center; padding: 0 2rem;
      gap: 2rem; box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .nav-brand { display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; font-weight: 700; }
    .nav-icon { font-size: 1.5rem; }
    .nav-links { display: flex; gap: 0.5rem; flex: 1; }
    .nav-links a {
      color: rgba(255,255,255,0.7); text-decoration: none; padding: 0.4rem 0.8rem;
      border-radius: 6px; font-size: 0.9rem; transition: all 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: white; background: rgba(255,255,255,0.15);
    }
    .nav-user { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }
    .user-badge {
      font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 20px;
      background: rgba(255,255,255,0.1);
    }
    .user-badge.admin { background: rgba(255,200,0,0.2); color: #ffd700; }
    .user-name { color: rgba(255,255,255,0.8); font-size: 0.9rem; }
    .btn-logout {
      padding: 0.35rem 0.8rem; background: rgba(255,80,80,0.2);
      color: #ff8080; border: 1px solid rgba(255,80,80,0.3);
      border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s;
    }
    .btn-logout:hover { background: rgba(255,80,80,0.4); }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
