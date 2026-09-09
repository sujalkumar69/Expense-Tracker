# Expense Tracker

Expense Tracker is a full-stack personal and group expense management application that helps users record individual spending, analyze category breakdowns, organize shared group expenses, calculate split balances, and generate UPI payment information for group settlements.

---

## Features

- **Authentication & Security**:
  - Secure user registration and login with bcrypt password hashing.
  - JWT Access Tokens (15-minute expiration) and Refresh Tokens (7-day expiration).
  - Automatic silent token refresh on 401 Unauthorized responses via Axios interceptors.
  - In-memory token blacklisting on logout.
  - Full server-side authorization enforcement against IDOR (Insecure Direct Object References).
  - CORS, Helmet security headers, Express Rate Limiting, and input validation.

- **Personal Expense Management**:
  - Record, edit, and delete personal expenses.
  - Category-based organization (Food, Transport, Utilities, Entertainment, Shopping, Health, Other).
  - Real-time search and category filtering.
  - Amount and date validation.

- **Group Expenses & Bill Splitting**:
  - Create shared expense groups with automatically generated invite codes.
  - Join existing groups using a 6-character invite code.
  - Record group expenses paid by specific members.
  - Automated split calculation (Total spend, per-person share, net balances).
  - Mark group members as settled once payments are confirmed.
  - Option to leave group or delete group (admin only).

- **UPI Settlement QR Generation**:
  - Generates custom UPI payment QR codes (`upi://pay?...`) using payee UPI ID, name, and exact calculated settlement amount.
  - Provides instant QR visual scan for mobile UPI apps (GPay, PhonePe, Paytm).

- **Dashboard & Insights**:
  - Total expenditure and current month spending metrics.
  - Spending by category breakdown with visual progress indicators.
  - Recent transactions table and quick expense modal.

---

## Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios with Request/Response Interceptors
- **Icons & Motion**: Framer Motion, Custom SVG Icon Set

### Backend
- **Runtime**: Node.js
- **Framework**: Express v5
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Security**: CORS (`cors`), Helmet (`helmet`), Express Rate Limit (`express-rate-limit`)
- **Logging**: Morgan (`morgan`)

### Database
- **Engine**: Oracle Database (`oracledb` node driver)

---

## Project Structure

```text
Project1/
├── frontend/                 # React 19 + Vite frontend application
│   ├── src/
│   │   ├── api/              # Centralized Axios client with refresh interceptors
│   │   ├── components/       # Reusable components (Navbar, PrivateRoute, LoadingScreen)
│   │   ├── context/          # AuthContext for session management
│   │   ├── pages/            # View pages (Login, Register, Dashboard, Expenses, Groups, GroupDetail, Profile)
│   │   ├── App.jsx           # Router configuration & protected layout
│   │   └── main.jsx
│   ├── .env.example          # Frontend environment template
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                  # Node.js + Express backend server
│   ├── config/               # OracleDB connection pool setup (`db.js`)
│   ├── controllers/          # Business logic controllers (userController, expenseController, groupController)
│   ├── middlewarre/          # JWT verification middleware (`authMiddleware.js`)
│   ├── routes/               # Express API routes (userRoutes, expenseRoutes, groupRoutes)
│   ├── .env                  # Local environment file (ignored by Git)
│   ├── .env.example          # Backend environment template
│   ├── package.json
│   └── server.js
│
├── .vscode/                  # Workspace settings
├── .gitignore                # Root Git ignore configuration
├── LICENSE                   # MIT License
├── package.json              # Monorepo root scripts & dev dependencies
└── README.md                 # Project documentation
```

---

## Installation & Setup

1. **Clone Repository & Install Dependencies**:
   ```bash
   # Install root, backend, and frontend dependencies
   npm install
   npm run install:all
   ```

2. **Environment Variables**:
   - **Backend Configuration**:
     Create `backend/.env` based on `backend/.env.example`:
     ```env
     PORT=5000
     DB_USER=your_oracle_user
     DB_PASSWORD=your_oracle_password
     DB_CONNECT_STRING=localhost:1521/XEPDB1
     JWT_SECRET=your_jwt_secret_key
     REFRESH_SECRET=your_refresh_secret_key
     ```

   - **Frontend Configuration**:
     Create `frontend/.env` based on `frontend/.env.example` (Optional, defaults to `http://localhost:5000/api`):
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```

---

## Running the Application

### Option A: Run Full-Stack Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
Starts both the Express backend (port 5000) and the Vite frontend dev server (port 5173).

### Option B: Run Services Separately
- **Backend**:
  ```bash
  cd backend
  npm run dev
  ```
- **Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## API Reference Overview

### Auth Routes (`/api/users`)
- `POST /api/users/register` - Register a new user account
- `POST /api/users/login` - Authenticate user and issue tokens
- `POST /api/users/refresh-token` - Issue new access token using refresh token
- `GET /api/users/profile` - Fetch current user profile (Protected)
- `PUT /api/users/profile` - Update user username and UPI ID (Protected)
- `POST /api/users/logout` - Blacklist active access token (Protected)

### Personal Expense Routes (`/api/expenses`)
- `POST /api/expenses/create` - Create personal expense (Protected)
- `GET /api/expenses/all` - List authenticated user's expenses (Protected)
- `PUT /api/expenses/:id` - Update owned expense (Protected)
- `DELETE /api/expenses/:id` - Delete owned expense (Protected)

### Group Expense Routes (`/api/groups`)
- `POST /api/groups/create` - Create group & generate invite code (Protected)
- `GET /api/groups/user-groups` - List groups joined by current user (Protected)
- `POST /api/groups/join` - Join group via invite code (Protected)
- `POST /api/groups/expense` - Add group expense (Protected)
- `GET /api/groups/expense/:groupId` - List group expenses (Protected)
- `GET /api/groups/members/:groupId` - List group members (Protected)
- `GET /api/groups/settle/:groupId` - Calculate split settlement balances (Protected)
- `PUT /api/groups/settle-member/:groupId/:userId` - Mark member as settled (Admin only)
- `DELETE /api/groups/leave/:groupId` - Leave group (Protected)
- `DELETE /api/groups/delete/:groupId` - Delete group (Admin only)
- `GET /api/groups/generate-qr/:groupID/:userId` - Generate UPI QR image (Protected)

---

## Payment & UPI Disclaimer

**IMPORTANT**: The application generates UPI payment QR codes (`upi://pay?...`) strictly for payment convenience. ExpenseTracker does not independently execute, process, or verify bank transactions. Group admins or members must manually verify that funds have reached the recipient before marking balances as settled in the application.

---

## License

This project is licensed under the [MIT License](LICENSE).
