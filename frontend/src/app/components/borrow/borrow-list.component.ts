import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowService } from '../../services/borrow.service';
import { Borrow } from '../../models/interfaces';

@Component({
  selector: 'app-borrow-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>📋 My Borrowed Books</h1>

      <div class="loading" *ngIf="loading">Loading your borrows...</div>

      <div class="borrows-list" *ngIf="!loading">
        <div class="borrow-card" *ngFor="let borrow of borrows"
          [class.overdue]="borrow.status === 'overdue'"
          [class.returned]="borrow.status === 'returned'">
          <div class="borrow-book">
            <div class="book-icon">📖</div>
            <div>
              <h3>{{ borrow.book?.title }}</h3>
              <p>{{ borrow.book?.author }}</p>
              <span class="isbn">{{ borrow.book?.isbn }}</span>
            </div>
          </div>
          <div class="borrow-details">
            <div class="detail">
              <span class="label">Borrowed</span>
              <span>{{ borrow.borrowDate | date:'mediumDate' }}</span>
            </div>
            <div class="detail">
              <span class="label">Due Date</span>
              <span [class.overdue-text]="borrow.status === 'overdue'">
                {{ borrow.dueDate | date:'mediumDate' }}
              </span>
            </div>
            <div class="detail" *ngIf="borrow.returnDate">
              <span class="label">Returned</span>
              <span>{{ borrow.returnDate | date:'mediumDate' }}</span>
            </div>
            <div class="detail" *ngIf="borrow.fine > 0">
              <span class="label">Fine</span>
              <span class="fine">₹{{ borrow.fine }}</span>
            </div>
          </div>
          <div class="borrow-status">
            <span class="status-badge" [class]="borrow.status">{{ borrow.status | titlecase }}</span>
            <button *ngIf="borrow.status !== 'returned'"
              class="btn-return" (click)="returnBook(borrow)"
              [disabled]="returning === borrow._id">
              {{ returning === borrow._id ? 'Returning...' : '↩️ Return' }}
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="borrows.length === 0">
          <span>📭</span>
          <p>You haven't borrowed any books yet.</p>
        </div>
      </div>

      <div class="toast" *ngIf="toast" [class]="toast.type">{{ toast.msg }}</div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 1.8rem; color: #1a1a2e; margin-bottom: 1.5rem; }
    .loading { text-align: center; padding: 3rem; color: #666; }
    .borrows-list { display: flex; flex-direction: column; gap: 1rem; }
    .borrow-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      display: grid; grid-template-columns: 1fr 1fr auto;
      gap: 1.5rem; align-items: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.06);
      border-left: 4px solid #3b82f6;
    }
    .borrow-card.overdue { border-color: #ef4444; background: #fff8f8; }
    .borrow-card.returned { border-color: #22c55e; opacity: 0.8; }
    .borrow-book { display: flex; gap: 1rem; align-items: flex-start; }
    .book-icon { font-size: 2.5rem; }
    .borrow-book h3 { margin: 0; font-size: 1rem; color: #1a1a2e; }
    .borrow-book p { margin: 0.2rem 0; color: #666; font-size: 0.85rem; }
    .isbn { color: #999; font-size: 0.78rem; }
    .borrow-details { display: flex; flex-direction: column; gap: 0.4rem; }
    .detail { display: flex; gap: 0.5rem; font-size: 0.9rem; }
    .label { font-weight: 600; color: #555; min-width: 70px; }
    .overdue-text { color: #ef4444; font-weight: 600; }
    .fine { color: #ef4444; font-weight: 700; }
    .borrow-status { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .status-badge {
      padding: 0.3rem 0.9rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700;
    }
    .status-badge.borrowed { background: #dbeafe; color: #1d4ed8; }
    .status-badge.returned { background: #dcfce7; color: #15803d; }
    .status-badge.overdue { background: #fee2e2; color: #b91c1c; }
    .btn-return {
      background: #0f3460; color: white; border: none; padding: 0.5rem 1rem;
      border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; white-space: nowrap;
    }
    .btn-return:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 4rem; color: #999; }
    .empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .toast {
      position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem;
      border-radius: 10px; font-weight: 600; z-index: 999;
    }
    .toast.success { background: #22c55e; color: white; }
    .toast.error { background: #ef4444; color: white; }
  `]
})
export class BorrowListComponent implements OnInit {
  borrows: Borrow[] = [];
  loading = false;
  returning: string | null = null;
  toast: { msg: string; type: string } | null = null;

  constructor(private borrowService: BorrowService) {}

  ngOnInit() { this.loadBorrows(); }

  loadBorrows() {
    this.loading = true;
    this.borrowService.getMyBorrows().subscribe({
      next: (res) => { this.borrows = res.borrows || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  returnBook(borrow: Borrow) {
    this.returning = borrow._id;
    this.borrowService.returnBook(borrow._id).subscribe({
      next: (res) => {
        const fineMsg = res.fine && res.fine > 0 ? ` Fine: ₹${res.fine}` : '';
        this.showToast(`Book returned successfully!${fineMsg}`, 'success');
        this.loadBorrows();
        this.returning = null;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Return failed', 'error');
        this.returning = null;
      }
    });
  }

  showToast(msg: string, type: string) {
    this.toast = { msg, type };
    setTimeout(() => this.toast = null, 4000);
  }
}
