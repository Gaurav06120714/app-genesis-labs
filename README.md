# ATTENDO — Smart Attendance Management

> QR-based attendance tracking for modern educational institutions. Built for students, teachers, parents, and admins.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-2.58-3ECF8E?style=flat-square&logo=supabase)

---

## What is ATTENDO?

ATTENDO is a production-ready SaaS attendance management platform for schools and colleges. Teachers generate expiring QR codes per class session — students scan them to mark attendance instantly. Parents receive live updates. Admins get full system visibility.

### Key Features

- **QR Code Attendance** — Unique, time-limited QR codes per class session (15-min expiry)
- **Role-Based Dashboards** — Separate portals for Admin, Teacher, Student, and Parent
- **Real-Time Records** — Attendance saved to Supabase the moment a student scans
- **Multi-Layer Verification** — Device, Wi-Fi, and facial verification architecture
- **Analytics & Reports** — Attendance trends, streaks, and per-class breakdowns
- **Parent Notifications** — Instant alerts when a student misses class
- **Dark / Light Mode** — Full theme support with system preference detection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Backend | Supabase (Auth + PostgreSQL + Realtime) |
| State | TanStack React Query 5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Routing | React Router v6 |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── components/
│   ├── common/        # StatCard, EmptyState, SkeletonCard, ErrorBoundary
│   ├── layout/        # DashboardLayout, ProtectedRoute
│   └── ui/            # shadcn/ui primitives (Button, Card, Dialog…)
├── pages/
│   ├── landing/       # Home.tsx — marketing landing page
│   ├── auth/          # Auth.tsx — login & signup
│   ├── dashboard/     # Student, Teacher, Parent, Admin dashboards
│   └── attendance/    # GenerateQR.tsx, ScanQR.tsx
├── hooks/             # useAuth, use-mobile, use-toast
├── services/
│   └── supabase/      # client.ts, types.ts
├── lib/               # utils.ts
├── types/             # Global TypeScript types (UserRole…)
├── App.tsx
└── main.tsx
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project

### 1. Clone the repo

```bash
git clone https://github.com/Gaurav06120714/app-genesis-labs.git
cd app-genesis-labs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file at the root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

Get these from your Supabase project → **Settings → API**.

### 4. Run database migrations

Open your Supabase project → **SQL Editor** and run the migration files from the `supabase/` folder in order.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

---

## Roles & Access

| Role | Access |
|------|--------|
| **Admin** | Full system — institutions, users, all sessions |
| **Teacher** | Their classes, QR generation, attendance reports |
| **Student** | Own attendance records, QR scanning |
| **Parent** | Linked children's attendance + notifications |

Sign up and assign a role via the Supabase `user_roles` table, or use the role selector on the signup form.

---

## Available Scripts

```bash
npm run dev        # Start development server (localhost:8080)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

---

## Database Schema (Supabase)

| Table | Description |
|-------|-------------|
| `profiles` | Base user info (name, email, photo) |
| `user_roles` | Role assignment per user |
| `institutions` | Schools / colleges |
| `students` | Student records with device + facial data |
| `teachers` | Teacher records |
| `classes` | Class definitions (subject, schedule) |
| `class_enrollments` | Student ↔ class mapping |
| `attendance_sessions` | QR code sessions (expiry, class, teacher) |
| `attendance_records` | Individual attendance marks with verification flags |
| `parent_student_links` | Parent ↔ child mapping |

---

## Deployment

### Vercel / Netlify (recommended)

```bash
npm run build
# Deploy the dist/ folder
```

Set the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) in your hosting dashboard.

---

## Roadmap

- [ ] Real-time attendance updates via Supabase subscriptions
- [ ] Google OAuth login
- [ ] Camera-based QR code scanning (student mobile)
- [ ] Facial recognition verification
- [ ] Wi-Fi SSID validation
- [ ] Push notifications (parent alerts)
- [ ] CSV/PDF attendance export
- [ ] LMS integrations (Google Classroom, Canvas)
- [ ] Mobile app (React Native)

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## License

MIT © [Gaurav](https://github.com/Gaurav06120714)
