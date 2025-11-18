# PayPals

A mobile-first platform for tracking shared expenses and splitting bills fairly among friends, roommates, travel groups, and business teams. PayPals makes group finances simple, transparent, and hassle-free with automated tracking, instant balance views, and seamless payment settlements.

## Problem Statement

Splitting shared expenses among friends, roommates, travel groups, or business teams often leads to confusion, unfair settlements, and delayed payments. Traditional methods like cash notes, chat messages, or spreadsheets lack:

- **Automation** - Manual tracking is error-prone and time-consuming
- **Transparency** - Unclear who owes whom and how much
- **Reminders** - Easy to forget who needs to pay back
- **Fair Splitting** - Complex calculations for different split scenarios
- **Payment Tracking** - No record of settlements

## Project Overview

PayPals is a comprehensive expense-sharing platform designed to simplify group finances. The application separates concerns between a robust backend API and a mobile-first responsive frontend interface, ensuring scalability, maintainability, and an excellent user experience. It automates expense tracking, provides transparent balance calculations, and streamlines payment settlements for any group size.

## Features

- **Expense Tracking**: Log shared expenses with automatic balance calculations
- **Fair Bill Splitting**: Multiple split options (equal, percentage, itemized)
- **Instant Balance View**: See who owes whom at a glance
- **Payment Settlements**: Record and track payments between group members
- **Group Management**: Create and manage expense groups for different contexts
- **User Authentication**: Secure registration and login with JWT token-based authentication
- **User Account Management**: Full user profile management with encrypted passwords
- **Mobile-First Design**: Responsive interface optimized for smartphones and tablets
- **RESTful API**: Well-structured API endpoints for all operations
- **Real-time Updates**: Instant synchronization of expenses and settlements
- **Database Integration**: Persistent data storage with MySQL and Prisma ORM

## 🏗️ System Architecture

The application follows a client-server architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│           Frontend (React)               │
│      Vite Build Tool & Bundler           │
│    - Expense Tracking UI                 │
│    - Group Management Pages              │
│    - Bill Splitting Interface            │
│    - Payment Settlement Views            │
│    - Authentication Pages                │
└─────────────────────────────────────────┘
                    ↕ HTTP/REST
┌─────────────────────────────────────────┐
│         Backend (Express.js)             │
│    - Expense Management API              │
│    - Group Management Endpoints          │
│    - Balance Calculation Engine          │
│    - Payment Settlement Logic            │
│    - Authentication Middleware           │
│    - Business Logic                      │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│    Database (MySQL with Prisma ORM)     │
│    - User Profiles                       │
│    - Groups & Members                    │
│    - Expense Records                     │
│    - Balance Tracking                    │
│    - Settlement History                  │
└─────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **React 19**: Latest React with modern hooks and features
- **Vite 7**: Fast build tool and development server
- **JavaScript (ES6+)**: Modern JavaScript with ES modules

### Backend
- **Express.js 5**: Fast and minimalist web framework
- **Node.js**: JavaScript runtime for server-side development
- **Prisma 6**: Next-generation ORM for database management
- **MySQL**: Relational database for data persistence

### Security & Authentication
- **JWT (jsonwebtoken)**: Secure token-based authentication
- **Bcrypt**: Password hashing and encryption
- **CORS**: Cross-origin resource sharing for API security

### Development Tools
- **Nodemon**: Auto-restart development server
- **ESLint**: Code quality and style enforcement
- **npm/yarn**: Package management

## Project Structure

```
PayPals/
├── backend/
│   ├── index.js                 # Express server entry point
│   ├── package.json             # Backend dependencies
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definition
│   │   └── migrations/          # Database migration files
│   ├── generated/
│   │   └── prisma/              # Prisma client auto-generated code
│   └── src/                     # Backend source code (when expanded)
│
├── frontend/
│   ├── PayPals/
│   │   ├── package.json         # Frontend dependencies
│   │   ├── vite.config.js       # Vite configuration
│   │   ├── eslint.config.js     # ESLint configuration
│   │   ├── index.html           # HTML entry point
│   │   ├── src/
│   │   │   ├── main.jsx         # React entry point
│   │   │   ├── App.jsx          # Main App component
│   │   │   ├── App.css          # App styles
│   │   │   ├── index.css        # Global styles
│   │   │   ├── pages/           # Page components
│   │   │   │   ├── login.jsx    # Login page
│   │   │   │   └── signup.jsx   # Signup page
│   │   │   └── assets/          # Static assets
│   │   └── public/              # Public files
│   │
│   └── README.md                # Frontend documentation
│
└── README.md                    # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MySQL** (v5.7 or higher) - [Download](https://www.mysql.com/)
- **Git** - For version control

### Environment Variables
You'll need to set up environment variables for database connection:

```
DATABASE_URL="mysql://username:password@localhost:3306/paypals"
JWT_SECRET="your_jwt_secret_key_here"
PORT=5000
```

### Authentication Endpoints

- **Register User**
  ```
  POST /auth/register
  Body: { name, email, password }
  ```

- **Login User**
  ```
  POST /auth/login
  Body: { email, password }
  Response: { token, user }
  ```

### User Endpoints

- **Get User Profile** (Protected)
  ```
  GET /users/:id
  Headers: { Authorization: Bearer <token> }
  ```

- **Update User Profile** (Protected)
  ```
  PUT /users/:id
  Headers: { Authorization: Bearer <token> }
  Body: { name, email }
  ```

### Group Endpoints

- **Create Group** (Protected)
  ```
  POST /groups
  Headers: { Authorization: Bearer <token> }
  Body: { name, description, members[] }
  ```

- **Get All Groups** (Protected)
  ```
  GET /groups
  Headers: { Authorization: Bearer <token> }
  ```

- **Add Member to Group** (Protected)
  ```
  POST /groups/:groupId/members
  Headers: { Authorization: Bearer <token> }
  Body: { userId }
  ```

### Expense Endpoints

- **Add Expense** (Protected)
  ```
  POST /expenses
  Headers: { Authorization: Bearer <token> }
  Body: { groupId, description, amount, paidBy, splitType, members[] }
  ```

- **Get Group Expenses** (Protected)
  ```
  GET /groups/:groupId/expenses
  Headers: { Authorization: Bearer <token> }
  ```

- **Get Expense Details** (Protected)
  ```
  GET /expenses/:id
  Headers: { Authorization: Bearer <token> }
  ```

- **Delete Expense** (Protected)
  ```
  DELETE /expenses/:id
  Headers: { Authorization: Bearer <token> }
  ```

### Settlement Endpoints

- **Get Group Balances** (Protected)
  ```
  GET /groups/:groupId/balances
  Headers: { Authorization: Bearer <token> }
  ```

- **Record Payment** (Protected)
  ```
  POST /settlements
  Headers: { Authorization: Bearer <token> }
  Body: { groupId, paidBy, paidTo, amount }
  ```

- **Get Settlement History** (Protected)
  ```
  GET /groups/:groupId/settlements
  Headers: { Authorization: Bearer <token> }
  ```


### Prisma Schema

The current schema includes a User model:

```prisma
model User {
  id        Int     @id @default(autoincrement())
  name      String
  email     String  @unique
  password  String
  createdAt DateTime @default(now())
}
```

## Security

### Implemented Security Features

1. **Password Hashing**: Bcrypt for secure password storage
2. **JWT Authentication**: Token-based session management
3. **CORS Protection**: Controlled cross-origin requests
4. **Input Validation**: Server-side validation for all inputs
5. **Secure Headers**: HTTP security headers
