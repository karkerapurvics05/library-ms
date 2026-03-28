# 📚 Library Management System — MEAN Stack

A full-stack Library Management System built with the **MEAN Stack** (MongoDB, Express.js, Angular 17, Node.js), featuring JWT authentication, role-based access control, and a complete borrow/return workflow.

---

## 🔧 Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | Angular 17 (Standalone) |
| Backend   | Node.js + Express.js    |
| Database  | MongoDB + Mongoose      |
| Auth      | JWT (JSON Web Tokens)   |
| Styling   | Component-scoped CSS    |

---

## ✨ Features

### 👤 User Authentication
- Register & Login with JWT
- Two roles: **Member (User)** and **Librarian (Admin)**
- Auto-generated Membership ID
- Protected routes with Angular Guards

### 📖 Book Management (Admin)
- Add, Edit, Delete books
- Track total & available copies
- Categorized books (Fiction, Science, Tech, etc.)

### 🔍 Search & Filter
- Search by title, author, or ISBN
- Filter by category
- Filter available books only
- Paginated results

### 📤 Borrow & Return System
- Borrow up to 3 books at a time
- 14-day borrow period
- Auto overdue detection
- Fine calculation (₹5/day after due date)
- Full borrow history per user

### 📊 Admin Dashboard
- Manage all borrow records
- View active/overdue/returned stats
- Force-return any book

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Angular CLI: `npm install -g @angular/cli`

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Frontend runs at: `http://localhost:4200`

---

## 📁 Project Structure

```
library-management/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema + bcrypt
│   │   ├── Book.js          # Book schema
│   │   └── Borrow.js        # Borrow/return schema
│   ├── routes/
│   │   ├── auth.routes.js   # Register, Login, Profile
│   │   ├── book.routes.js   # CRUD + search/filter
│   │   └── borrow.routes.js # Borrow, return, history
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT protect + adminOnly
│   ├── .env.example
│   └── server.js
│
└── frontend/
    └── src/app/
        ├── components/
        │   ├── auth/         # Login, Register
        │   ├── books/        # BookList, BookForm
        │   ├── borrow/       # BorrowList, AdminBorrow
        │   └── dashboard/    # Dashboard, Navbar
        ├── services/
        │   ├── auth.service.ts
        │   ├── book.service.ts
        │   ├── borrow.service.ts
        │   └── auth.interceptor.ts
        ├── guards/
        │   ├── auth.guard.ts
        │   └── admin.guard.ts
        └── models/
            └── interfaces.ts
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint             | Description        | Access |
|--------|---------------------|--------------------|--------|
| POST   | /api/auth/register  | Register user      | Public |
| POST   | /api/auth/login     | Login user         | Public |
| GET    | /api/auth/me        | Get profile        | Auth   |

### Books
| Method | Endpoint         | Description           | Access |
|--------|------------------|-----------------------|--------|
| GET    | /api/books       | Get all (search/filter) | Auth |
| GET    | /api/books/:id   | Get single book       | Auth   |
| POST   | /api/books       | Add book              | Admin  |
| PUT    | /api/books/:id   | Update book           | Admin  |
| DELETE | /api/books/:id   | Delete book           | Admin  |

### Borrow
| Method | Endpoint                | Description          | Access |
|--------|------------------------|----------------------|--------|
| POST   | /api/borrow            | Borrow a book        | Auth   |
| PUT    | /api/borrow/return/:id | Return a book        | Auth   |
| GET    | /api/borrow/my         | My borrow history    | Auth   |
| GET    | /api/borrow/all        | All borrow records   | Admin  |

---

## 🔐 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/library_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
```

---

## 👥 Default Test Accounts

After registering, set `role: "admin"` for a librarian account.  
Or register via the UI and select **"Librarian (Admin)"** during registration.

---

## 📌 Business Rules

- Maximum **3 active borrows** per member
- Borrow duration: **14 days**
- Overdue fine: **₹5 per day**
- Only admins can add/edit/delete books
- Members cannot borrow the same book twice simultaneously
