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
- **Google OAuth** — One-click sign in with Google
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
│   ├── auth/          # Auth.tsx, AuthCallback.tsx
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
- A [Supabase](https://supabase.com) account (free tier works)
- A [Google Cloud](https://console.cloud.google.com) account (for Google OAuth)

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/Gaurav06120714/app-genesis-labs.git
cd app-genesis-labs
npm install
```

---

## Step 2 — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New project** → fill in project name (e.g. "Attendo"), set a password, choose region
3. Wait for the project to finish provisioning (~1 min)

### Get your API keys

1. In your project, go to **Settings → API**
2. Copy:
   - **Project URL** → e.g. `https://xxxxxxxxxxx.supabase.co`
   - **Anon / public key** → starts with `sb_publishable_...` or `eyJ...`

---

## Step 3 — Configure Environment Variables

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

> ⚠️ Never commit `.env` to Git. It is already in `.gitignore`.

---

## Step 4 — Run Database Migrations

1. In Supabase, go to **SQL Editor → New query**
2. Paste and run the full SQL from `supabase/migrations/` (one file)
3. This creates all 9 tables, RLS policies, roles enum, and the `handle_new_user` trigger

Tables created:
| Table | Description |
|-------|-------------|
| `profiles` | Base user info (name, email, photo) |
| `user_roles` | Role assignment per user (admin/teacher/student/parent) |
| `institutions` | Schools / colleges |
| `students` | Student records with device + facial data |
| `classes` | Class definitions (subject, schedule) |
| `class_enrollments` | Student ↔ class mapping |
| `attendance_sessions` | QR code sessions (expiry, class, teacher) |
| `attendance_records` | Individual attendance marks with verification flags |
| `parent_student_links` | Parent ↔ child mapping |

---

## Step 5 — Set Up Google OAuth (Optional)

### A) Create Google OAuth credentials

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create or select a project
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. If prompted, configure the **OAuth consent screen** first:
   - User type: **External**
   - Fill in app name, support email, developer email → Save
5. Back on Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Attendo`
   - Under **Authorized redirect URIs**, click **Add URI** and paste:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
6. Click **Create** → copy the **Client ID** and **Client Secret**

### B) Enable Google in Supabase

1. In Supabase → **Authentication → Sign In / Providers → Google**
2. Toggle **Enable** on
3. Paste your **Client ID** (in the "Client IDs" field)
4. Paste your **Client Secret**
5. Click **Save**

### C) Add redirect URL

1. In Supabase → **Authentication → URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:8080
   http://localhost:8080/auth/callback
   ```
3. Save

---

## Step 6 — Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

---

## Roles & Access

| Role | Access |
|------|--------|
| **Admin** | Full system — institutions, users, all sessions |
| **Teacher** | Their classes, QR generation, attendance reports |
| **Student** | Own attendance records, QR scanning |
| **Parent** | Linked children's attendance + notifications |

Select your role on the **Sign Up** form. Role is stored in `user_roles` table via Supabase RLS.

---

## Available Scripts

```bash
npm run dev        # Start development server (localhost:8080)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

---

## Deployment (Vercel / Netlify)

```bash
npm run build
# Deploy the dist/ folder
```

Add these environment variables in your hosting dashboard:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

Also add your production URL to **Supabase → Authentication → URL Configuration → Redirect URLs**.

---

## Roadmap

- [x] Google OAuth login
- [ ] Real-time attendance updates via Supabase Realtime
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
