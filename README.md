# Expense Tracker

A full-stack monorepo application for managing personal and group expenses with interactive UI and secure JWT authentication.

## Project Structure

```text
Project1/
├── frontend/             # React 19 + Vite 8 frontend client
│   ├── src/              # React components, pages, context, & API helpers
│   ├── public/           # Static public assets
│   ├── .env.example      # Frontend environment variable template
│   └── package.json
│
├── backend/              # Node.js + Express backend server
│   ├── config/           # Database configuration (OracleDB)
│   ├── controllers/      # Route controllers (users, expenses, groups)
│   ├── middlewarre/      # Auth & custom middleware
│   ├── routes/           # Express routes
│   ├── .env.example      # Backend environment variable template
│   └── package.json
│
├── .vscode/              # Editor settings
├── .gitignore            # Root Git ignore rules
├── package.json          # Root scripts & monorepo tools
└── README.md             # Project documentation
```

## Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios
- **Animations & Icons**: Framer Motion, Lottie React

### Backend
- **Runtime**: Node.js
- **Framework**: Express v5
- **Authentication**: JWT (JSON Web Tokens) with Refresh Tokens
- **Security**: Helmet, Express Rate Limit, bcryptjs
- **Logging**: Morgan

### Database
- **Database**: Oracle Database (`oracledb`)

---

## Installation

1. **Clone Repository & Install Dependencies**:
   ```bash
   # Install dependencies for root monorepo, backend, and frontend
   npm install
   npm run install:all
   ```

2. **Environment Variables Configuration**:
   - **Backend**:
     Copy `backend/.env.example` to `backend/.env` and fill in your Oracle Database credentials and JWT secrets:
     ```env
     PORT=5000
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     DB_CONNECT_STRING=localhost:1521/XEPDB1
     JWT_SECRET=your_jwt_secret
     REFRESH_SECRET=your_refresh_secret
     ```

   - **Frontend**:
     Copy `frontend/.env.example` to `frontend/.env` (optional, defaults to `http://localhost:5000/api`):
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```

---

## Running the Project

### Option A: Run Both Simultaneously (Root Monorepo Command)
From the root directory, run:
```bash
npm run dev
```
This uses `concurrently` to start both the Express backend (port 5000) and the Vite frontend dev server (port 5173).

### Option B: Run Individually

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

## Building for Production

To generate the frontend production build:
```bash
npm run build:frontend
```
or inside `frontend/`:
```bash
cd frontend
npm run build
```
