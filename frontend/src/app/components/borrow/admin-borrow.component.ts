import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../services/borrow.service';
import { Borrow } from '../../models/interfaces';

@Component({
  selector: 'app-admin-borrow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>📊 All Borrow Records</h1>

      <div class="stats-row">
        <div class="mini-stat">
          <span>{{ totalBorrows }}</span> Total
        </div>
        <div class="mini-stat active">
          <span>{{ activeBorrows }}</span> Active
        </div>
        <div class="mini-stat overdue">
          <span>{{ overdueBorrows }}</span> Overdue
        </div>
        <div class="mini-stat returned">
          <span>{{ returnedBorrows }}</span> Returned
        </div>
      </div>

      <div class="loading" *ngIf="loading">Loading records...</div>

      <table class="borrow-table" *ngIf="!loading">
        <thead>
          <tr>
            <th>Member</th>
            <th>Book</th>
            <th>Borrow Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Status</th>
            <th>Fine</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let b of borrows" [class]="b.status">
            <td>
              <strong>{{ b.user?.name }}</strong><br>
              <small>{{ b.user?.membershipId }}</small>
            </td>
            <td>
              <strong>{{ b.book?.title }}</strong><br>
              <small>{{ b.book?.author }}</small>
            </td>
            <td>{{ b.borrowDate | date:'shortDate' }}</td>
            <td [class.overdue-text]="b.status === 'overdue'">{{ b.dueDate | date:'shortDate' }}</td>
            <td>{{ b.returnDate ? (b.returnDate | date:'shortDate') : '—' }}</td>
            <td><span class="status-badge" [class]="b.status">{{ b.status | titlecase }}</span></td>
            <td [class.fine-text]="b.fine > 0">{{ b.fine > 0 ? '₹' + b.fine : '—' }}</td>
            <td>
              <button *ngIf="b.status !== 'returned'"
                class="btn-return" (click)="returnBook(b)"
                [disabled]="returning === b._id">
                {{ returning === b._id ? '...' : 'Return' }}
              </button>
              <span *ngIf="b.status === 'returned'" class="done">✓</span>
            </td>
          </tr>
          <tr *ngIf="borrows.length === 0">
            <td colspan="8" style="text-align:center; padding: 2rem; color: #999;">No borrow records found.</td>
          </tr>
        </tbody>
      </table>
      <div class="toast" *ngIf="toast" [class]="toast.type">{{ toast.msg }}</div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 1.8rem; color: #1a1a2e; margin-bottom: 1.5rem; }
    .stats-row { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .mini-stat {
      background: white; border-radius: 10px; padding: 1rem 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07); font-size: 0.9rem; color: #555;
      border-left: 3px solid #3b82f6;
    }
    .mini-stat span { font-size: 1.8rem; font-weight: 700; color: #1a1a2e; display: block; }
    .mini-stat.active { border-color: #f97316; }
    .mini-stat.overdue { border-color: #ef4444; }
    .mini-stat.returned { border-color: #22c55e; }
    .loading { text-align: center; padding: 3rem; color: #666; }
    .borrow-table {
      width: 100%; border-collapse: collapse; background: white;
      border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    thead { background: #1a1a2e; color: white; }
    th { padding: 1rem; text-align: left; font-size: 0.85rem; font-weight: 600; }
    td { padding: 0.9rem 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.88rem; }
    td small { color: #999; }
    tr:last-child td { border-bottom: none; }
    tr.overdue { background: #fff8f8; }
    tr.returned { opacity: 0.75; }
    .status-badge { padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .status-badge.borrowed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.returned { background: #dcfce7; color: #15803d; }
    .status-badge.overdue { background: #fee2e2; color: #b91c1c; }
    .overdue-text { color: #ef4444; font-weight: 600; }
    .fine-text { color: #ef4444; font-weight: 700; }
    .btn-return {
      background: #0f3460; color: white; border: none; padding: 0.3rem 0.8rem;
      border-radius: 6px; cursor: pointer; font-size: 0.8rem;
    }
    .done { color: #22c55e; font-weight: 700; }
    .toast {
      position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem;
      border-radius: 10px; font-weight: 600; z-index: 999;
    }
    .toast.success { background: #22c55e; color: white; }
    .toast.error { background: #ef4444; color: white; }
  `]
})
export class AdminBorrowComponent implements OnInit {
  borrows: Borrow[] = [];
  loading = false;
  returning: string | null = null;
  toast: { msg: string; type: string } | null = null;

  get totalBorrows() { return this.borrows.length; }
  get activeBorrows() { return this.borrows.filter(b => b.status === 'borrowed').length; }
  get overdueBorrows() { return this.borrows.filter(b => b.status === 'overdue').length; }
  get returnedBorrows() { return this.borrows.filter(b => b.status === 'returned').length; }

  constructor(private borrowService: BorrowService) {}

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading = true;
    this.borrowService.getAllBorrows().subscribe({
      next: (res) => { this.borrows = res.borrows || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  returnBook(borrow: Borrow) {
    this.returning = borrow._id;
    this.borrowService.returnBook(borrow._id).subscribe({
      next: (res) => {
        const fineMsg = res.fine && res.fine > 0 ? ` Fine: ₹${res.fine}` : '';
        this.showToast(`Returned.${fineMsg}`, 'success');
        this.loadAll();
        this.returning = null;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed', 'error');
        this.returning = null;
      }
    });
  }

  showToast(msg: string, type: string) {
    this.toast = { msg, type };
    setTimeout(() => this.toast = null, 3000);
  }
}
