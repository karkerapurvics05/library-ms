import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse, Book } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = 'http://localhost:5000/api/books';

  constructor(private http: HttpClient) {}

  getBooks(filters: { search?: string; category?: string; available?: boolean; page?: number; limit?: number } = {}) {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.available !== undefined) params = params.set('available', String(filters.available));
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));
    return this.http.get<ApiResponse<Book[]>>(this.apiUrl, { params });
  }

  getBook(id: string) {
    return this.http.get<ApiResponse<Book>>(`${this.apiUrl}/${id}`);
  }

  addBook(book: Partial<Book>) {
    return this.http.post<ApiResponse<Book>>(this.apiUrl, book);
  }

  updateBook(id: string, book: Partial<Book>) {
    return this.http.put<ApiResponse<Book>>(`${this.apiUrl}/${id}`, book);
  }

  deleteBook(id: string) {
    return this.http.delete<ApiResponse<Book>>(`${this.apiUrl}/${id}`);
  }
}
