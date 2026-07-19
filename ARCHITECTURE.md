# CU Events — Full System Architecture & Technical Documentation

## Project Overview

**CU Events** is a full-stack, role-based web application built for Chandigarh University to centralize campus event discovery, registration, and organizer administration. Built as a 12-Hour Challenge submission, it is a production-grade, deployed system accessible at:

Live URL: https://college-event-management-portal.vercel.app/
Repository: https://github.com/NavdeepSingh0/College-Event-Management-Portal

---

## 1. High-Level Architecture

The system follows a decoupled, 3-tier architecture with complete separation between the presentation layer, application layer, and data layer.

```
[CLIENT LAYER - Tier 1]
React + Vite (Vercel Deployment)
Pages: Home, Events, Calendar, Event Details, Student Dashboard, Organiser Dashboard
        |
        | HTTP REST (JSON) via fetch()
        | Authorization: Bearer <JWT>
        | VITE_API_URL environment variable
        v
[APPLICATION LAYER - Tier 2]
Node.js + Express.js (Render.com Deployment)
Routes: /auth | /events | /register | /clubs | /organiser | /notifications | /favorites | /dashboard
Middleware: authMiddleware (JWT verify), organiserOnly Guard
Utility: Nodemailer SMTP (Gmail) — OTP Email Delivery
        |
        | @supabase/supabase-js client
        | SUPABASE_URL + SUPABASE_ANON_KEY
        v
[DATA LAYER - Tier 3]
Supabase (PostgreSQL) — Cloud Hosted
Tables: users, events, registrations, favorites, notifications, otps, club_memberships, event_analytics
```

---

## 2. Technology Stack

| Layer | Technology | Version | Justification |
|---|---|---|---|
| Frontend Framework | React | 18.x | Component-based UI with hooks |
| Frontend Bundler | Vite | 5.x | Lightning-fast HMR and optimized builds |
| Frontend Routing | React Router DOM | v6 | Client-side SPA routing |
| Backend Runtime | Node.js | 20.x | Non-blocking I/O for API workloads |
| Backend Framework | Express.js | 4.x | Minimal, high-performance REST API |
| Database | PostgreSQL (via Supabase) | 15 | Relational integrity, JSONB support |
| Database Client | @supabase/supabase-js | 2.x | Type-safe PostgREST wrapper |
| Authentication | JWT (jsonwebtoken) | 9.x | Stateless, scalable auth tokens |
| Password Hashing | bcryptjs | 2.x | Salted bcrypt hashing (10 rounds) |
| Email Service | Nodemailer + Gmail SMTP | 6.x | Real OTP email delivery |
| Styling | Vanilla CSS (CSS Variables) | — | Full theme control, dark mode |
| Icon Library | lucide-react | — | Consistent SVG icon set |
| Frontend Hosting | Vercel | — | Auto-deploy from GitHub |
| Backend Hosting | Render.com | — | Managed Node.js runtime |
| Database Hosting | Supabase Cloud | — | Managed PostgreSQL |

---

## 3. Repository & Directory Structure

```
cu-events/
|-- frontend/                          # React / Vite Application (Vercel)
|   |-- public/images/categories/      # 8 event category banner images
|   |-- src/
|       |-- App.jsx                    # Root: routing, theme state, scroll reveal
|       |-- main.jsx                   # React DOM entry point
|       |-- global.css                 # Core design system (~5300 lines)
|       |-- custom-design.css          # Component-level overrides
|       |-- components/
|       |   |-- Navbar.jsx             # Navigation, auth buttons, theme toggle
|       |   |-- Footer.jsx             # Site footer
|       |   |-- EventCard.jsx          # Reusable event card with OTP registration
|       |   |-- AuthModal.jsx          # Login + Signup modal (role-based)
|       |-- pages/
|       |   |-- Home.jsx               # Landing page: hero, categories, clubs, CTA
|       |   |-- Events.jsx             # Event listing with sidebar filters
|       |   |-- EventDetails.jsx       # Full event + OTP registration modal
|       |   |-- StudentDashboard.jsx   # Registered events, profile, settings
|       |   |-- OrganiserDashboard.jsx # Create events, manage attendees, analytics
|       |   |-- CalendarView.jsx       # Monthly calendar with event markers
|       |-- context/
|       |   |-- AuthContext.jsx        # Global user state (React Context API)
|       |-- utils/
|           |-- api.js                 # API client (auto Bearer token injection)
|
|-- backend/                           # Node.js / Express API (Render.com)
|   |-- server/
|   |   |-- index.js                   # Bootstrap: CORS, routes, mailer init
|   |   |-- db.js                      # Supabase client singleton
|   |   |-- middleware/
|   |   |   |-- auth.js                # 3 JWT guards: authMiddleware, optionalAuth, organiserOnly
|   |   |-- routes/
|   |   |   |-- auth.js                # Signup, Login, Demo Login, Profile, Password
|   |   |   |-- events.js              # CRUD, search, filter events
|   |   |   |-- register.js            # OTP send/verify + cancel registration
|   |   |   |-- organiser.js           # Organiser event mgmt + analytics
|   |   |   |-- clubs.js               # Club listing + join/leave
|   |   |   |-- dashboard.js           # Student summary endpoint
|   |   |   |-- favorites.js           # Bookmark events
|   |   |   |-- notifications.js       # Notification feed + mark-read
|   |   |-- utils/
|   |       |-- email.js               # Nodemailer: Gmail SMTP + OTP HTML template
|   |-- supabase/
|       |-- schema.sql                 # Complete DB schema + 17 seed events
|
|-- README.md
|-- ARCHITECTURE.md
```

---

## 4. Database Architecture (PostgreSQL via Supabase)

### Entity Relationships
```
users --< registrations >-- events
users --< favorites >-- events
users --< notifications
users --< club_memberships
events --< event_analytics
events --< otps
```

### Table: users
| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | Auto-increment |
| name | TEXT | Required |
| email | TEXT UNIQUE | Required, lowercased |
| cu_id | TEXT UNIQUE | Nullable for external users |
| phone | TEXT | |
| department | TEXT | e.g., CSE, MBA |
| year | TEXT | e.g., 3rd Year |
| password_hash | TEXT | bcrypt 10 rounds |
| role | TEXT | 'attendee' or 'organiser' |
| organization_name | TEXT | Organisers only |
| organization_type | TEXT | 'university_club', 'department', 'external_org' |
| college | TEXT | Default: Chandigarh University |
| bio | TEXT | |
| created_at | TIMESTAMPTZ | |

### Table: events
| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| title | TEXT | |
| category | TEXT | Technical, Cultural, Academic, Sports, etc. |
| organizer | TEXT | Club or Department name |
| date | TEXT | YYYY-MM-DD |
| start_time / end_time | TEXT | HH:MM format |
| venue | TEXT | |
| price | TEXT | 'Free' or numeric string |
| capacity | INTEGER | Max attendees |
| registered_count | INTEGER | Updated by DB RPC atomically |
| featured | INTEGER | 0 or 1 |
| description | TEXT | Rich description |
| highlights | JSONB | Array of strings |
| tags | JSONB | Array of strings |
| speakers | JSONB | Array of {name, role} objects |
| agenda | JSONB | Array of schedule items |
| visibility | TEXT | 'public', 'cu_only', 'invite_only' |
| allow_external | INTEGER | 1 = open to external users |
| created_by | BIGINT FK | References users.id |

### Table: registrations
| Column | Type | Notes |
|---|---|---|
| user_id | BIGINT FK | References users.id |
| event_id | BIGINT FK | References events.id |
| status | TEXT | 'confirmed' |
| uid | TEXT | CU ID or email prefix |
| participant_name/college/phone | TEXT | External participant fields |
| UNIQUE | (user_id, event_id) | Database-enforced prevention of double registration |

### Table: otps
| Column | Type | Notes |
|---|---|---|
| email | TEXT | Target email |
| otp | TEXT | 6-digit code |
| event_id | BIGINT | Associated event |
| user_id | BIGINT | Requesting user |
| expires_at | TIMESTAMPTZ | 10-minute TTL |

### Database Functions (Supabase RPCs)
- `increment_registered_count(p_event_id)` — Atomic integer increment
- `decrement_registered_count(p_event_id)` — Atomic integer decrement

---

## 5. Backend Architecture (Node.js / Express)

### Server Bootstrap
```
dotenv.config() -> initMailer() -> Express app -> CORS + JSON middleware -> Mount 8 route modules -> app.listen()
```

### Full API Route Map

| Method | Path | Auth Guard | Description |
|---|---|---|---|
| POST | /api/auth/signup | None | Create student or organiser account |
| POST | /api/auth/login | None | Login with email or CU ID |
| POST | /api/auth/demo-login | None | Instant demo access |
| GET | /api/auth/me | JWT | Get session user profile |
| PUT | /api/auth/profile | JWT | Update profile fields |
| POST | /api/auth/change-password | JWT | Secure password change |
| GET | /api/events | Optional JWT | List with search, category, date, price filters |
| GET | /api/events/:id | Optional JWT | Full event detail |
| POST | /api/events | JWT + Organiser | Create event |
| PUT | /api/events/:id | JWT + Organiser | Edit event |
| DELETE | /api/events/:id | JWT + Organiser | Delete event |
| POST | /api/register/send-otp | JWT | Generate + email 6-digit OTP |
| POST | /api/register/verify-otp | JWT | Verify OTP + confirm registration |
| GET | /api/registrations | JWT | Get user's all registrations |
| DELETE | /api/registrations/:eventId | JWT | Cancel registration |
| GET | /api/organiser/events | JWT + Organiser | Events by this organiser |
| GET | /api/organiser/events/:id/attendees | JWT + Organiser | Attendee list |
| GET | /api/organiser/analytics | JWT + Organiser | Registration stats |
| GET | /api/dashboard | JWT | Student dashboard summary |
| GET | /api/notifications | JWT | Notification feed with unread count |
| PUT | /api/notifications/read-all | JWT | Mark all as read |
| GET | /api/favorites | JWT | Get bookmarked events |
| POST | /api/favorites | JWT | Add bookmark |
| DELETE | /api/favorites/:eventId | JWT | Remove bookmark |
| GET | /api/clubs | None | All clubs listing |
| POST | /api/clubs/:id/join | JWT | Join a club |
| DELETE | /api/clubs/:id/leave | JWT | Leave a club |

### Auth Middleware (3 Guards)
1. **authMiddleware** — Strict JWT verification. Decodes userId + role into req. Returns 401 if missing/expired.
2. **optionalAuth** — Non-blocking JWT validation. Enriches req if token present, allows unauthenticated through.
3. **organiserOnly** — Returns 403 if req.userRole !== 'organiser'. Stacked on top of authMiddleware.

### OTP Email System
- Initializes at startup with Gmail SMTP (configurable via env vars)
- Gracefully falls back to Ethereal fake inbox in dev mode
- Emergency fallback: OTP logged to server console if all email fails
- HTML email template with inline CSS, CU Events branding, 6-digit OTP displayed prominently
- OTPs are single-use (deleted from DB after successful verification)

---

## 6. Frontend Architecture (React / Vite)

### App Root (App.jsx) Responsibilities
1. **React Router Routes** — Maps 6 URL paths to 6 page components
2. **Theme Management** — `theme` state in localStorage. `useEffect` adds/removes `dark` class on `<html>`. Default: always `'light'`
3. **Scroll Reveal Animation** — `IntersectionObserver` watches `.fade-in` and `.slide-up` elements. `MutationObserver` handles async-loaded event cards

### Global Auth State (AuthContext.jsx)
A React Context Provider wrapping the entire app tree exposes:
- `user` — Object or null
- `loading` — Boolean (blocks render until /auth/me resolves)
- `login(identifier, password)` — Stores JWT in localStorage
- `register(userData)` — Stores JWT in localStorage  
- `logout()` — Clears JWT and user state
- Auto-logout listener on `auth:unauthorized` custom browser event

### API Client (utils/api.js)
A singleton with `get()`, `post()`, `put()`, `del()` methods that:
- Reads `VITE_API_URL` from Vite env for production URL
- Auto-injects `Authorization: Bearer <token>` header
- Intercepts 401 and dispatches global `auth:unauthorized` event

### Page Components Summary

| Page | Route | Key Features |
|---|---|---|
| Home.jsx | / | Hero with next-event ticker, 8-category grid, featured events, clubs carousel, student testimonials, stats bar |
| Events.jsx | /events | Sidebar filters (search, date, category, price, venue), sort dropdown, event grid, URL query params support |
| EventDetails.jsx | /events/:id | Full hero banner, highlights list, speaker cards, agenda timeline, registration modal with OTP steps |
| StudentDashboard.jsx | /dashboard | Registered events with Cancel button, profile editor form, notifications tab |
| OrganiserDashboard.jsx | /organiser-dashboard | Event creation form, attendee table, analytics stat cards, empty state placeholders |
| CalendarView.jsx | /calendar | Monthly grid, event dot indicators, click-to-view popover |

---

## 7. CSS Design System

### Architecture
100% Vanilla CSS using semantic CSS Custom Properties (variables). No utility framework.

### Core Design Tokens
```css
/* Backgrounds */
--bg: #F8F9FB          /* Page background */
--bg-card: #FFFFFF     /* Cards, modals, dropdowns */
--bg-nav: rgba(255,255,255,0.95)  /* Frosted glass navbar */

/* Typography */
--text: #1A1A2E        /* Primary headings and body */
--text-secondary: #5F6878   /* Subtext */
--text-tertiary: #9CA3AF    /* Placeholder, muted */

/* Borders */
--border: #E2E4EA
--border-light: #F0F1F4

/* Brand Colors */
--accent: #0066FF      /* Primary action blue */
--green: #22C55E       /* Success / free events */
--red: #EF4444         /* Danger / deadlines */

/* Category Colors */
--cat-technical: #8B5CF6
--cat-cultural: #EC4899
--cat-academic: #3B82F6
--cat-sports: #22C55E
```

### Dark Mode
`html.dark` class overrides all CSS variables. Because every UI element uses variables (not hardcoded hex colors), dark mode works universally with zero per-component overrides:

```css
html.dark {
  --bg: #121212;
  --bg-card: #1e1e1e;
  --bg-nav: rgba(30,30,30,0.95);
  --text: #e5e7eb;
  --text-secondary: #9ca3af;
  --border: #333333;
}
```

---

## 8. Security Implementation

| Concern | Implementation |
|---|---|
| Password Storage | bcrypt with 10 salt rounds. Never stored in plain text. |
| Session Tokens | JWT signed with JWT_SECRET. 7-day expiry. Stored in localStorage. |
| Role Authorization | organiserOnly middleware guard on all organiser routes. |
| Email Verification | 6-digit OTP emailed before registration confirmed. 10-minute TTL. Single-use. |
| Double Registration | UNIQUE(user_id, event_id) database constraint. |
| CU-Only Events | Backend checks @cuchd.in email domain or cu_id field. |
| Secrets Management | All keys in environment variables. .env excluded from git via .gitignore. |
| Input Validation | Server-side validation on all endpoints. |
| SQL Injection | Supabase JS client uses PostgREST parameterized queries. |
| Unauthorized Access | Global 401 interceptor in API client auto-logs out stale sessions. |

---

## 9. Deployment Architecture

```
Developer -> git push -> GitHub

GitHub -> (Auto-trigger on push)
  |
  |-- Vercel (Frontend)
  |     Root directory: /frontend
  |     Build command: npm run build
  |     Output directory: dist/
  |     Environment variable: VITE_API_URL = https://<backend>.onrender.com/api
  |     Live: https://college-event-management-portal.vercel.app
  |
  |-- Render.com (Backend) [Manual deploy or webhook]
        Root directory: /backend
        Build command: npm install
        Start command: npm start
        Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
        Live: https://<name>.onrender.com
              |
              v
        Supabase Cloud (PostgreSQL)
        Project: fmyrecqsitwnwyhporon.supabase.co
```

---

## 10. Key User Flows

### Student Registration (OTP Flow)
```
1. Browse Events page (no auth required)
2. Click Register -> Auth modal if not logged in
3. Login -> redirect back to event
4. Click "Register for this Event" button
5. Enter email for OTP
6. Backend: generate OTP, store in otps table (10-min TTL), send Gmail email
7. Student enters 6-digit code
8. Backend: verify OTP, insert into registrations, increment registered_count via RPC, delete OTP, create notification
9. Student Dashboard shows event with Cancel option
```

### Organiser Event Creation
```
1. Register with role "Organiser"
2. JWT contains role claim -> Navbar routes to /organiser-dashboard
3. Fill event creation form (title, date, time, venue, category, capacity, price)
4. POST /api/organiser/events (JWT + organiserOnly guard)
5. Event stored in DB -> visible in public listing immediately
6. Organiser views attendee list and analytics from dashboard
```

---

## 11. Environment Variables Reference

### Backend (.env)
| Variable | Description |
|---|---|
| SUPABASE_URL | Supabase project URL |
| SUPABASE_ANON_KEY | Supabase anon/public key |
| JWT_SECRET | Secret string for JWT signing |
| PORT | Port number (default 3001) |
| SMTP_HOST | Email server (smtp.gmail.com) |
| SMTP_PORT | 587 for TLS |
| SMTP_USER | Gmail address used to send OTPs |
| SMTP_PASS | Gmail App Password (2FA required) |

### Frontend (.env or Vercel Dashboard)
| Variable | Description |
|---|---|
| VITE_API_URL | Backend URL + /api (e.g. https://cu-events.onrender.com/api) |

---

## 12. Bonus Features Implemented

| Feature | How |
|---|---|
| Email OTP Verification | Real Gmail SMTP via Nodemailer for every registration |
| Dark Mode | Structural CSS variable system. Manual toggle in Navbar. |
| Calendar View | Full monthly calendar with event dot indicators |
| Registration Progress Bar | Animated fill bar: registered/capacity on every card |
| Notification System | In-app bell with unread count badge, mark-all-read |
| Organiser Analytics | Stat cards: total registrations, fill rate per event |
| Club Membership | Browse 10+ clubs, join/leave stored in DB |
| CU-Only Restriction | Backend enforces @cuchd.in or cu_id for restricted events |
| External Participants | Non-CU users can register for open events with college info |
| Event Favoriting | Bookmark events to My Favorites in dashboard |
| Demo Login | One-click as Student or Organiser (no registration needed) |
| Cancel Registration | Atomic decrement of registered_count via Supabase RPC |
| Responsive Mobile Design | Hamburger menu, mobile-first grid layouts |
| Persistent Theme | Dark/light mode preference saved in localStorage |
