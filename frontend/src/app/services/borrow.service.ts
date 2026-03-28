import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, Borrow } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class BorrowService {
  private apiUrl = 'http://localhost:5000/api/borrow';

  constructor(private http: HttpClient) {}

  borrowBook(bookId: string) {
    return this.http.post<ApiResponse<Borrow>>(this.apiUrl, { bookId });
  }

  returnBook(borrowId: string) {
    return this.http.put<ApiResponse<Borrow>>(`${this.apiUrl}/return/${borrowId}`, {});
  }

  getMyBorrows() {
    return this.http.get<ApiResponse<Borrow[]>>(`${this.apiUrl}/my`);
  }

  getAllBorrows() {
    return this.http.get<ApiResponse<Borrow[]>>(`${this.apiUrl}/all`);
  }
}
