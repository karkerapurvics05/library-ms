export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  membershipId: string;
  createdAt?: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  publisher?: string;
  publishedYear?: number;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string;
  addedBy?: User;
  createdAt?: string;
}

export interface Borrow {
  _id: string;
  user: User;
  book: Book;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fine: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  book?: Book;
  books?: Book[];
  borrow?: Borrow;
  borrows?: Borrow[];
  count?: number;
  total?: number;
  pages?: number;
  currentPage?: number;
  data?: T;
  fine?: number;
}

export const BOOK_CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Science', 'Technology',
  'History', 'Biography', 'Mathematics', 'Literature', 'Other'
];
