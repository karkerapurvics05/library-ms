import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'books',
    loadComponent: () => import('./components/books/book-list.component').then(m => m.BookListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'books/add',
    loadComponent: () => import('./components/books/book-form.component').then(m => m.BookFormComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'books/edit/:id',
    loadComponent: () => import('./components/books/book-form.component').then(m => m.BookFormComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'borrow',
    loadComponent: () => import('./components/borrow/borrow-list.component').then(m => m.BorrowListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/borrows',
    loadComponent: () => import('./components/borrow/admin-borrow.component').then(m => m.AdminBorrowComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
