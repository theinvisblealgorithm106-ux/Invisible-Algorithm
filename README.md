# The Invisible Algorithm — Platform

Official full-stack platform for **The Invisible Algorithm**, an international student-led technology and business non-profit focused on AI, ML, computer science, financial literacy, and technology education.

---

## Architecture

| Layer      | Technology              | Hosting         |
|------------|-------------------------|-----------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS | Vercel   |
| Backend    | Node.js, Express, TypeScript | Render      |
| Database   | MongoDB with Mongoose   | MongoDB Atlas   |
| Auth       | JWT (access + refresh)  | —               |
| Email      | Nodemailer (SMTP)       | —               |

---

## Repository Structure

```
the-invisible-algorithm/
├── frontend/          # Next.js application
├── backend/           # Express REST API
├── .gitignore
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/the-invisible-algorithm.git
cd the-invisible-algorithm

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Fill in the required values (see Environment Variables section below).

**Frontend** — copy `frontend/.env.example` to `frontend/.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000

# Database — Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/invisible-algorithm?retryWrites=true&w=majority

# Authentication — Use a long random string (32+ characters)
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=REPLACE_WITH_DIFFERENT_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email — SMTP credentials for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@theinvisiblealgorithm.org
FROM_NAME=The Invisible Algorithm

# Admin — Initial super admin credentials
ADMIN_EMAIL=admin@theinvisiblealgorithm.org
ADMIN_PASSWORD=REPLACE_WITH_STRONG_PASSWORD

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Site metadata
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=The Invisible Algorithm
```

---

## Deployment

### MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write permissions
3. Whitelist IP addresses (or use `0.0.0.0/0` for all IPs)
4. Copy the connection string to `MONGODB_URI` in backend environment

### Backend — Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repository
4. Set **Root Directory** to `backend`
5. Set **Build Command**: `npm install && npm run build`
6. Set **Start Command**: `npm start`
7. Add all environment variables from `backend/.env.example`
8. Copy the service URL (e.g., `https://invisible-algorithm-api.onrender.com`)

### Frontend — Vercel

1. Push code to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL + `/api`
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL or custom domain
5. Deploy

### Custom Domain

1. In Vercel: Settings → Domains → Add your domain
2. Update DNS at your registrar:
   - Add `A` record pointing to Vercel's IP, or
   - Add `CNAME` record pointing to `cname.vercel-dns.com`
3. Vercel automatically provisions SSL

---

## User Roles

| Role          | Description                                        |
|---------------|----------------------------------------------------|
| `student`     | Public applicant, can submit membership application |
| `member`      | Approved member, access to member resources        |
| `researcher`  | Can submit and manage research papers              |
| `admin`       | Content management, application review             |
| `super_admin` | Full platform access, user role management         |

---

## API Overview

Base URL: `/api`

| Route prefix         | Description              |
|----------------------|--------------------------|
| `/auth`              | Login, register, refresh |
| `/users`             | User management          |
| `/research`          | Research papers          |
| `/events`            | Events and workshops     |
| `/applications`      | Membership applications  |
| `/announcements`     | Announcements            |
| `/contact`           | Contact form             |
| `/newsletter`        | Newsletter subscriptions |
| `/partnerships`      | School partnerships      |

---

## License

Copyright © The Invisible Algorithm. All rights reserved.
