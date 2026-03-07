# SuperLog

A proof-of-work tracker and portfolio builder for Superteam Nigeria. SuperLog helps developers and creators log their activities, plan goals, build streaks, and showcase consistent progress — all in one place.

## Features

### Activity Tracking
- **GitHub Integration** — Auto-sync commits, PRs, issues, reviews, and releases via OAuth + webhooks
- **Tweet Logging** — Manually log tweets with content parsing and metrics
- **Blog Posts** — Track published articles across platforms
- **Quick Log Modal** — Fast activity entry from anywhere in the app

### Goal Planning
- **Weekly Goals** — Plan and track weekly deliverables with status progression (Planned → In Progress → Completed)
- **Monthly OKRs** — Set objectives with measurable key results, linked to weekly goals
- **Daily Focus** — Set a single daily focus statement for intentional work

### Calendar & Scheduling
- **Time Blocking** — Schedule focus blocks, community events, hackathons, and learning sessions
- **FullCalendar Integration** — Interactive calendar with drag-and-drop event management

### Reporting & Analytics
- **Weekly Reports** — Auto-generated reports with scoring, highlights, and planning accuracy metrics
- **Planned vs Actual** — Compare what you planned against what you shipped
- **Export** — Download reports as CSV or PDF

### Gamification
- **Streaks** — Track activity, code, writing, consistency, and planning streaks with streak shields
- **Badges** — Earn achievements for milestones
- **Levels & XP** — Progress through levels as you accumulate experience
- **Leaderboard** — Community rankings by score, streaks, and level

### Social
- **Public Profiles** — Shareable profile pages at `/p/[username]` with stats, badges, and activity history
- **Shoutouts** — Recognize other community members
- **Reactions** — React to activities in the community feed

### Admin Dashboard
- **Verification Queue** — Review and approve/reject submitted activities
- **Reward Distribution** — Award SOL rewards to top contributors
- **Community Analytics** — Track member engagement, activity trends, and growth
- **Member Management** — View and manage community members

### Landing Page
- **Nigeria Activity Heatmap** — Interactive Leaflet map showing developer activity by state with activity type filtering (All / Commits / Content)
- **Live Activity Ticker** — Real-time feed of recent community contributions
- **Platform Stats** — Dynamic counters for members, contributions, projects, and blogs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Google OAuth + Email/Password) |
| Charts | Recharts |
| Calendar | FullCalendar |
| Maps | Leaflet + react-leaflet |
| PDF Export | @react-pdf/renderer |
| GitHub API | Octokit |
| Validation | Zod |
| Icons | lucide-react |

## Project Structure

```
src/
├── app/
│   ├── (admin)/admin/        # Admin dashboard (overview, members, verification, rewards, analytics)
│   ├── (dashboard)/          # Authenticated routes (dashboard, activities, projects, goals, calendar, reports, profile, settings)
│   ├── api/                  # REST API routes
│   │   ├── auth/             # NextAuth + signup
│   │   ├── activities/       # Activity CRUD
│   │   ├── projects/         # Project CRUD
│   │   ├── goals/            # Goal CRUD + monthly OKRs
│   │   ├── calendar/         # Calendar events
│   │   ├── github/           # Sync + webhook
│   │   ├── cron/             # Scheduled jobs (github-sync, weekly-report)
│   │   ├── reports/          # Generate + export
│   │   ├── social/           # Shoutouts + reactions
│   │   ├── admin/            # Verification + rewards
│   │   └── ...               # tweets, blogs, profile, notifications
│   ├── login/                # Login/signup page
│   ├── p/[username]/         # Public profile
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # Base components (avatar, button, card, modal, table, etc.)
│   ├── layout/               # Sidebar, topbar, mobile nav, providers
│   ├── dashboard/            # Dashboard widgets
│   ├── activities/           # Activity cards + quick log
│   ├── goals/                # Goal planning components
│   ├── calendar/             # Calendar view + event forms
│   ├── reports/              # Report cards + detail views
│   ├── admin/                # Admin-specific components
│   ├── landing/              # Landing page sections
│   ├── onboarding/           # Welcome wizard + checklist
│   └── social/               # Community feed, reactions, shoutouts
├── hooks/                    # Custom React hooks (activities, tweets, blogs, projects, notifications)
├── lib/                      # Business logic
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma client singleton
│   ├── github/               # GitHub API client, sync, webhook handler
│   ├── reports/              # Report generation, scoring, CSV/PDF export
│   ├── streaks/              # Streak tracking engine
│   ├── badges/               # Badge achievement engine
│   ├── landing/              # Landing page data fetchers
│   └── utils/                # API helpers, date utils, validation schemas
├── types/                    # TypeScript type definitions + NextAuth augmentation
└── middleware.ts             # Auth middleware (protects dashboard + admin routes)
```

## Database Schema

**19 models** organized into five domains:

- **Auth** — User, Account, Session, VerificationToken
- **Activities** — GitHubActivity, Tweet, BlogPost, Verification
- **Planning** — Project, Goal, MonthlyObjective, KeyResult, CalendarEvent, DailyFocus
- **Gamification** — Streak, Badge, Shoutout, Reward, Reaction, Notification
- **System** — WebhookEvent, OnboardingProgress, WeeklyReport

Key relationships:
- Users own all activities, goals, projects, and reports
- Goals link to projects and key results (OKR tree)
- Activities have optional verification status
- Streaks are tracked per type per user (activity, code, writing, consistency, planning)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local install or Docker)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd SuperLog
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file:
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/superlog"

   # NextAuth
   AUTH_SECRET="<run: openssl rand -base64 32>"

   # Google OAuth (from Google Cloud Console)
   GOOGLE_ID="your-google-client-id"
   GOOGLE_SECRET="your-google-client-secret"

   # GitHub (for activity sync — optional for basic usage)
   GITHUB_ID="your-github-oauth-app-id"
   GITHUB_SECRET="your-github-oauth-app-secret"
   GITHUB_WEBHOOK_SECRET="<run: openssl rand -hex 32>"

   # Cron job authentication
   CRON_SECRET="<run: openssl rand -hex 32>"
   ```

3. **Push schema to database**
   ```bash
   npm run db:push
   ```

4. **Seed demo data** (optional)
   ```bash
   npm run db:seed
   ```
   Creates 3 demo users (admin, developer, writer) with sample activities, goals, and badges.

5. **Start the dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:migrate` | Create and apply migration |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio GUI |

## Authentication

SuperLog supports two authentication methods:

- **Google OAuth** — One-click sign-in via Google account
- **Email/Password** — Traditional registration with bcrypt-hashed passwords

GitHub OAuth is available as an in-app integration (via Settings) for syncing development activity, but is not used for login.

### Authorization

- **Public routes** — Landing page (`/`), login (`/login`), public profiles (`/p/[username]`)
- **Authenticated routes** — Dashboard and all `/dashboard/*` routes require sign-in
- **Admin routes** — `/admin/*` routes require the `ADMIN` role

## API Overview

All API routes are under `/api/` and return JSON. Protected routes require a valid session.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register with email/password |
| `/api/activities` | GET | List activities (filterable) |
| `/api/projects` | GET, POST | List/create projects |
| `/api/projects/[id]` | GET, PATCH, DELETE | Project CRUD |
| `/api/goals` | GET, POST | List/create goals |
| `/api/goals/[id]` | GET, PATCH, DELETE | Goal CRUD |
| `/api/goals/monthly` | POST | Create monthly objective |
| `/api/calendar` | GET, POST | List/create calendar events |
| `/api/tweets` | POST | Log a tweet |
| `/api/blogs` | POST | Log a blog post |
| `/api/github/sync` | POST | Trigger GitHub activity sync |
| `/api/github/webhook` | POST | Receive GitHub webhooks |
| `/api/reports/generate` | POST | Generate weekly report |
| `/api/reports/export` | GET | Export report (CSV/PDF) |
| `/api/social/shoutouts` | POST | Send a shoutout |
| `/api/social/reactions` | POST | React to an activity |
| `/api/profile` | PATCH | Update user profile |
| `/api/notifications` | GET | List notifications |
| `/api/admin/verification` | GET, PATCH | Manage verifications |
| `/api/admin/rewards` | POST | Award SOL rewards |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Vercel auto-detects Next.js and deploys

The `build` script runs `prisma generate` before `next build` automatically.

### Self-Hosted

```bash
npm run build
npm run start
```

Ensure PostgreSQL is accessible and all environment variables are set.

## License

Private project built for Superteam Nigeria.
