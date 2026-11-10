# Online PC Store

A full-stack web application for managing an online PC hardware store, built with React, Express, and MariaDB.

The project currently features a modern admin dashboard for managing products, categories, customers, orders, and payments. It is designed as the foundation for a future customer-facing PC e-commerce website.

## Features

- **Admin Dashboard** — Modern dark-themed interface with cyan accents and glass-style UI elements.
- **Product Management** — Create, view, update, and delete products.
- **Category Management** — Organize products into categories.
- **Customer Management** — Manage customer records.
- **Order Management** — Track orders and their associated items.
- **Payment Management** — Manage payment records.
- **Admin Authentication** — Password-based login with secure, HTTP-only session cookies.
- **Persistent Sessions** — Database-backed admin sessions.
- **REST API** — Express backend connected to MariaDB.
- **Responsive Interface** — Built with React and Tailwind CSS.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Icons | Lucide React |
| Backend | Node.js, Express 5 |
| Database | MariaDB |
| Authentication | Scrypt password hashing, database-backed sessions |
| Deployment | Heroku |
| Version Control | Git and GitHub |

## Project Structure

```text
online-pc-store/
├── backend/
│   ├── server.js
│   ├── hash-password.mjs
│   ├── package.json
│   └── package-lock.json
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js
- MariaDB
- npm

### 1. Clone the repository

```bash
git clone https://github.com/simplyamir/online-pc-store.git
cd online-pc-store
```

### 2. Install dependencies

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

### 3. Configure the database

Create a MariaDB database named:

```sql
CREATE DATABASE online_pc_store;
```

Set up the application's required tables and configure your database connection.

Create a `backend/.env` file containing the required database and admin authentication environment variables. Never commit this file to Git.

### 4. Start the backend

From the `backend` directory:

```bash
npm start
```

The backend runs at:

```text
http://localhost:3001
```

### 5. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

The frontend is available at:

```text
http://localhost:5173
```

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the frontend production build |
| `npm run lint` | Run ESLint |
| `npm start` | Start the Express server |

## Security

The application includes several security measures:

- Scrypt-based admin password hashing
- HTTP-only authentication cookies
- Server-side session validation
- Persistent sessions stored in MariaDB
- Rate limiting
- HTTP security headers using Helmet
- Environment variables for sensitive configuration

Production deployment requires additional configuration, including HTTPS and a hosted database.

## Project Status

**In development**

The admin dashboard and its core management features are implemented. Deployment and a customer-facing storefront are planned.

### Future Improvements

- Deploy the application to Heroku
- Build a customer-facing storefront
- Add product browsing and search
- Implement a shopping cart
- Add a customer checkout experience
- Improve inventory management
- Expand dashboard analytics

## Author

Developed by [simplyamir](https://github.com/simplyamir).

## License

No license has been specified for this project.
