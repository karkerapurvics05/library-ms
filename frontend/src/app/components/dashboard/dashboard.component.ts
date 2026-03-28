import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/book.service';
import { BorrowService } from '../../services/borrow.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="welcome-banner">
        <div>
          <h1>Welcome back, {{ auth.currentUser()?.name }}! 👋</h1>
          <p>Membership ID: <strong>{{ auth.currentUser()?.membershipId }}</strong></p>
        </div>
        <div class="role-chip" [class.admin]="auth.isAdmin()">
          {{ auth.isAdmin() ? 'Librarian' : 'Member' }}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalBooks }}</div>
            <div class="stat-label">Total Books</div>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ availableBooks }}</div>
            <div class="stat-label">Available</div>
          </div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon">📤</div>
          <div class="stat-info">
            <div class="stat-value">{{ activeBorrows }}</div>
            <div class="stat-label">Borrowed</div>
          </div>
        </div>
        <div class="stat-card red">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <div class="stat-value">{{ overdueBorrows }}</div>
            <div class="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a routerLink="/books" class="action-card">
            <span>🔍</span>
            <span>Browse Books</span>
          </a>
          <a routerLink="/borrow" class="action-card">
            <span>📋</span>
            <span>My Borrows</span>
          </a>
          <a *ngIf="auth.isAdmin()" routerLink="/books/add" class="action-card admin">
            <span>➕</span>
            <span>Add New Book</span>
          </a>
          <a *ngIf="auth.isAdmin()" routerLink="/admin/borrows" class="action-card admin">
            <span>📊</span>
            <span>Manage Borrows</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .welcome-banner {
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      color: white; border-radius: 16px; padding: 2rem;
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 2rem;
    }
    .welcome-banner h1 { margin: 0; font-size: 1.8rem; }
    .welcome-banner p { margin: 0.5rem 0 0; opacity: 0.8; }
    .role-chip {
      padding: 0.5rem 1.2rem; border-radius: 20px;
      background: rgba(255,255,255,0.15); font-weight: 600;
    }
    .role-chip.admin { background: rgba(255,200,0,0.25); color: #ffd700; }
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem; margin-bottom: 2rem;
    }
    .stat-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      display: flex; gap: 1rem; align-items: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      border-left: 4px solid;
    }
    .stat-card.blue { border-color: #3b82f6; }
    .stat-card.green { border-color: #22c55e; }
    .stat-card.orange { border-color: #f97316; }
    .stat-card.red { border-color: #ef4444; }
    .stat-icon { font-size: 2rem; }
    .stat-value { font-size: 2rem; font-weight: 700; color: #1a1a2e; line-height: 1; }
    .stat-label { color: #666; font-size: 0.9rem; margin-top: 0.25rem; }
    .quick-actions h2 { font-size: 1.3rem; color: #1a1a2e; margin-bottom: 1rem; }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
    .action-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      text-decoration: none; color: #1a1a2e; font-weight: 600;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s; font-size: 0.95rem;
    }
    .action-card span:first-child { font-size: 2rem; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
    .action-card.admin { border: 2px solid #ffd700; background: #fffdf0; }
  `]
})
export class DashboardComponent implements OnInit {
  totalBooks = 0;
  availableBooks = 0;
  activeBorrows = 0;
  overdueBorrows = 0;

  constructor(public auth: AuthService, private bookService: BookService, private borrowService: BorrowService) {}

  ngOnInit() {
    this.bookService.getBooks({ limit: 1000 }).subscribe(res => {
      this.totalBooks = res.total || 0;
      this.availableBooks = res.books?.filter(b => b.availableCopies > 0).length || 0;
    });
    this.borrowService.getMyBorrows().subscribe(res => {
      this.activeBorrows = res.borrows?.filter(b => b.status === 'borrowed').length || 0;
      this.overdueBorrows = res.borrows?.filter(b => b.status === 'overdue').length || 0;
    });
  }
}
