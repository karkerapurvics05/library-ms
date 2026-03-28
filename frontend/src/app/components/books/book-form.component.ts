import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { BOOK_CATEGORIES } from '../../models/interfaces';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="form-card">
        <div class="form-header">
          <h1>{{ isEdit ? '✏️ Edit Book' : '➕ Add New Book' }}</h1>
          <a routerLink="/books" class="btn-back">← Back to Books</a>
        </div>

        <form (ngSubmit)="onSubmit()" #bookForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="book.title" name="title" required
                placeholder="Book title" class="form-control" />
            </div>
            <div class="form-group">
              <label>Author *</label>
              <input type="text" [(ngModel)]="book.author" name="author" required
                placeholder="Author name" class="form-control" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>ISBN *</label>
              <input type="text" [(ngModel)]="book.isbn" name="isbn" required
                placeholder="e.g. 978-3-16-148410-0" class="form-control" />
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select [(ngModel)]="book.category" name="category" required class="form-control">
                <option value="">Select category</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Publisher</label>
              <input type="text" [(ngModel)]="book.publisher" name="publisher"
                placeholder="Publisher name" class="form-control" />
            </div>
            <div class="form-group">
              <label>Published Year</label>
              <input type="number" [(ngModel)]="book.publishedYear" name="publishedYear"
                placeholder="e.g. 2023" min="1000" max="2024" class="form-control" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Total Copies *</label>
              <input type="number" [(ngModel)]="book.totalCopies" name="totalCopies"
                required min="1" placeholder="Number of copies" class="form-control" />
            </div>
            <div class="form-group">
              <label>Cover Image URL</label>
              <input type="text" [(ngModel)]="book.coverImage" name="coverImage"
                placeholder="https://..." class="form-control" />
            </div>
          </div>

          <div class="form-group full">
            <label>Description</label>
            <textarea [(ngModel)]="book.description" name="description"
              placeholder="Brief description of the book..." class="form-control" rows="3"></textarea>
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>
          <div class="success-msg" *ngIf="success">{{ success }}</div>

          <div class="form-actions">
            <a routerLink="/books" class="btn-cancel">Cancel</a>
            <button type="submit" class="btn-submit" [disabled]="loading || bookForm.invalid">
              {{ loading ? 'Saving...' : (isEdit ? 'Update Book' : 'Add Book') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
    .form-card { background: white; border-radius: 16px; padding: 2.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .form-header h1 { margin: 0; font-size: 1.6rem; color: #1a1a2e; }
    .btn-back { color: #0f3460; text-decoration: none; font-weight: 600; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 0; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group.full { grid-column: 1 / -1; }
    label { display: block; font-weight: 600; color: #333; margin-bottom: 0.4rem; font-size: 0.9rem; }
    .form-control {
      width: 100%; padding: 0.75rem 1rem; border: 2px solid #e0e0e0;
      border-radius: 8px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;
    }
    .form-control:focus { outline: none; border-color: #0f3460; }
    textarea.form-control { resize: vertical; font-family: inherit; }
    .error-msg { background: #fee; border: 1px solid #fcc; color: #c00; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
    .success-msg { background: #efe; border: 1px solid #cfc; color: #060; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
    .btn-cancel {
      padding: 0.75rem 1.5rem; border: 2px solid #e0e0e0; border-radius: 8px;
      color: #666; text-decoration: none; font-weight: 600;
    }
    .btn-submit {
      padding: 0.75rem 2rem; background: #0f3460; color: white; border: none;
      border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;
    }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class BookFormComponent implements OnInit {
  book: any = { title: '', author: '', isbn: '', category: '', publisher: '', publishedYear: null, totalCopies: 1, description: '', coverImage: '' };
  categories = BOOK_CATEGORIES;
  isEdit = false;
  bookId = '';
  loading = false;
  error = '';
  success = '';

  constructor(private bookService: BookService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.bookId = this.route.snapshot.params['id'];
    if (this.bookId) {
      this.isEdit = true;
      this.bookService.getBook(this.bookId).subscribe(res => {
        if (res.book) this.book = { ...res.book };
      });
    }
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    const op = this.isEdit
      ? this.bookService.updateBook(this.bookId, this.book)
      : this.bookService.addBook(this.book);

    op.subscribe({
      next: (res) => {
        this.success = res.message || 'Saved successfully!';
        setTimeout(() => this.router.navigate(['/books']), 1200);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save book.';
        this.loading = false;
      }
    });
  }
}
