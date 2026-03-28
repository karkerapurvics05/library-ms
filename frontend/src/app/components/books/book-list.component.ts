import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { BorrowService } from '../../services/borrow.service';
import { AuthService } from '../../services/auth.service';
import { Book, BOOK_CATEGORIES } from '../../models/interfaces';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📚 Book Catalogue</h1>
        <a *ngIf="auth.isAdmin()" routerLink="/books/add" class="btn-add">+ Add Book</a>
      </div>

      <!-- Search & Filter -->
      <div class="filter-bar">
        <input type="text" [(ngModel)]="search" (input)="onSearch()"
          placeholder="🔍 Search by title, author, or ISBN..." class="search-input" />
        <select [(ngModel)]="selectedCategory" (change)="loadBooks()" class="filter-select">
          <option value="">All Categories</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
        <label class="filter-check">
          <input type="checkbox" [(ngModel)]="onlyAvailable" (change)="loadBooks()" />
          Available only
        </label>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">Loading books...</div>

      <!-- Book Grid -->
      <div class="books-grid" *ngIf="!loading">
        <div class="book-card" *ngFor="let book of books">
          <div class="book-cover" [style.background]="getColor(book.category)">
            <span class="book-category-icon">{{ getCategoryIcon(book.category) }}</span>
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">by {{ book.author }}</p>
            <span class="category-badge">{{ book.category }}</span>
            <p class="book-isbn">ISBN: {{ book.isbn }}</p>
            <div class="availability">
              <span [class]="book.availableCopies > 0 ? 'available' : 'unavailable'">
                {{ book.availableCopies > 0 ? '✅ ' + book.availableCopies + ' available' : '❌ Not available' }}
              </span>
              <span class="copies">/ {{ book.totalCopies }} total</span>
            </div>
            <div class="book-actions">
              <button *ngIf="book.availableCopies > 0 && !auth.isAdmin()"
                class="btn-borrow" (click)="borrowBook(book)" [disabled]="borrowing === book._id">
                {{ borrowing === book._id ? 'Borrowing...' : '📤 Borrow' }}
              </button>
              <ng-container *ngIf="auth.isAdmin()">
                <a [routerLink]="['/books/edit', book._id]" class="btn-edit">✏️ Edit</a>
                <button class="btn-delete" (click)="deleteBook(book._id)">🗑️ Delete</button>
              </ng-container>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="books.length === 0">
          <span>📭</span>
          <p>No books found matching your search.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1">← Prev</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages">Next →</button>
      </div>

      <div class="toast" *ngIf="toast" [class]="toast.type">{{ toast.msg }}</div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.8rem; color: #1a1a2e; margin: 0; }
    .btn-add {
      background: #0f3460; color: white; padding: 0.6rem 1.2rem;
      border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;
    }
    .filter-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap; }
    .search-input {
      flex: 1; min-width: 200px; padding: 0.75rem 1rem; border: 2px solid #e0e0e0;
      border-radius: 8px; font-size: 1rem;
    }
    .search-input:focus { outline: none; border-color: #0f3460; }
    .filter-select {
      padding: 0.75rem 1rem; border: 2px solid #e0e0e0; border-radius: 8px;
      background: white; font-size: 0.95rem;
    }
    .filter-check { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; cursor: pointer; }
    .books-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;
    }
    .book-card {
      background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: transform 0.2s;
    }
    .book-card:hover { transform: translateY(-4px); }
    .book-cover {
      height: 120px; display: flex; align-items: center; justify-content: center;
    }
    .book-category-icon { font-size: 3rem; }
    .book-info { padding: 1.25rem; }
    .book-title { font-size: 1rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.25rem; }
    .book-author { color: #666; font-size: 0.85rem; margin: 0 0 0.5rem; }
    .category-badge {
      display: inline-block; background: #e8f0fe; color: #0f3460;
      padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
    }
    .book-isbn { color: #999; font-size: 0.78rem; margin: 0.5rem 0; }
    .availability { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; font-size: 0.85rem; }
    .available { color: #22c55e; font-weight: 600; }
    .unavailable { color: #ef4444; font-weight: 600; }
    .copies { color: #999; }
    .book-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-borrow {
      background: #0f3460; color: white; border: none; padding: 0.4rem 0.9rem;
      border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;
    }
    .btn-borrow:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-edit {
      background: #fef3c7; color: #92400e; padding: 0.4rem 0.8rem;
      border-radius: 6px; text-decoration: none; font-size: 0.85rem;
    }
    .btn-delete {
      background: #fee2e2; color: #991b1b; border: none; padding: 0.4rem 0.8rem;
      border-radius: 6px; cursor: pointer; font-size: 0.85rem;
    }
    .empty-state { grid-column: 1/-1; text-align: center; padding: 4rem; color: #999; }
    .empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
    .pagination button {
      padding: 0.5rem 1rem; background: #0f3460; color: white; border: none;
      border-radius: 6px; cursor: pointer;
    }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .loading { text-align: center; padding: 3rem; color: #666; font-size: 1.1rem; }
    .toast {
      position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem;
      border-radius: 10px; font-weight: 600; z-index: 999;
    }
    .toast.success { background: #22c55e; color: white; }
    .toast.error { background: #ef4444; color: white; }
  `]
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  loading = false;
  search = '';
  selectedCategory = '';
  onlyAvailable = false;
  categories = BOOK_CATEGORIES;
  currentPage = 1;
  totalPages = 1;
  borrowing: string | null = null;
  toast: { msg: string; type: string } | null = null;
  private searchTimer: any;

  constructor(
    private bookService: BookService,
    private borrowService: BorrowService,
    public auth: AuthService
  ) {}

  ngOnInit() { this.loadBooks(); }

  loadBooks() {
    this.loading = true;
    this.bookService.getBooks({
      search: this.search,
      category: this.selectedCategory,
      available: this.onlyAvailable || undefined,
      page: this.currentPage,
      limit: 12
    }).subscribe({
      next: (res) => {
        this.books = res.books || [];
        this.totalPages = res.pages || 1;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.currentPage = 1; this.loadBooks(); }, 400);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadBooks();
  }

  borrowBook(book: Book) {
    this.borrowing = book._id;
    this.borrowService.borrowBook(book._id).subscribe({
      next: () => {
        this.showToast(`"${book.title}" borrowed successfully!`, 'success');
        this.loadBooks();
        this.borrowing = null;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Borrow failed', 'error');
        this.borrowing = null;
      }
    });
  }

  deleteBook(id: string) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    this.bookService.deleteBook(id).subscribe({
      next: () => { this.showToast('Book deleted', 'success'); this.loadBooks(); },
      error: (err) => this.showToast(err.error?.message || 'Delete failed', 'error')
    });
  }

  showToast(msg: string, type: string) {
    this.toast = { msg, type };
    setTimeout(() => this.toast = null, 3000);
  }

  getColor(category: string): string {
    const colors: Record<string, string> = {
      'Fiction': '#dbeafe', 'Non-Fiction': '#dcfce7', 'Science': '#fef9c3',
      'Technology': '#e0e7ff', 'History': '#fce7f3', 'Biography': '#ffedd5',
      'Mathematics': '#f0fdf4', 'Literature': '#ede9fe', 'Other': '#f1f5f9'
    };
    return colors[category] || '#f1f5f9';
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Fiction': '✨', 'Non-Fiction': '📰', 'Science': '🔬',
      'Technology': '💻', 'History': '🏛️', 'Biography': '👤',
      'Mathematics': '🧮', 'Literature': '🖋️', 'Other': '📖'
    };
    return icons[category] || '📖';
  }
}
