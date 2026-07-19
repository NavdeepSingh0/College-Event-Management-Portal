# CU Events - College Event Management Portal
**Live Deployment:** [https://college-event-management-portal.vercel.app/](https://college-event-management-portal.vercel.app/)

**Comprehensive System Architecture and Technical Documentation**

## 1. Abstract
CU Events is an enterprise-grade, full-stack web application designed to centralize college event discovery, student registration, and organizer administration. Built specifically for the 12-Hour Challenge, it bridges the gap between students looking for campus activities and club organizers managing capacities, approvals, and metrics. It features a modern, responsive UI and a robust RESTful API backed by a relational PostgreSQL database.

## 2. Directory Structure & Codebase Organization
The repository is strictly divided into two distinct environments to enforce the separation of concerns between client-side rendering and server-side orchestration.

```text
cu-events/
├── frontend/                        # React / Vite Application
│   ├── src/
│   │   ├── components/              # Reusable UI widgets (AuthModal, Navbar, EventCard)
│   │   ├── pages/                   # Top-level view controllers (Home, EventDetails)
│   │   │   ├── dashboard/           # Student registration management
│   │   │   └── organiser/           # Administrative event creation & analytics
│   │   ├── context/                 # React Context API for global state (Auth)
│   │   ├── utils/                   # API interceptors and configuration (api.js)
│   │   ├── global.css               # Core styling, variables, and typography
│   │   ├── custom-design.css        # Specialized UI polish and animations
│   │   └── App.jsx                  # Core application router and layout wrapper
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite bundler configuration
│
├── backend/                         # Node.js / Express REST API
│   ├── server/
│   │   ├── routes/                  # API endpoint definitions (auth, events, register, notifications)
│   │   ├── middleware/              # JWT verification and request interception
│   │   ├── utils/                   # Helper functions (email generation, OTPs)
│   │   ├── db.js                    # Supabase client instantiation
│   │   └── index.js                 # Application entry point and middleware configuration
│   ├── supabase/                    # Database architecture
│   │   └── schema.sql               # PostgreSQL tables, relations, triggers, and RPCs
│   ├── .env                         # Server environment variables
│   └── package.json                 # Backend dependencies
│
└── README.md                        # Master architectural documentation
```

## 3. Technology Stack

| Architecture Layer | Core Technology | Primary Function & Justification |
| :--- | :--- | :--- |
| **Frontend UI** | React.js (Vite) | High-performance, component-based rendering. |
| **Styling** | Vanilla CSS / Modules | Custom styling with CSS variables for dynamic themes and animations. |
| **Icons** | Lucide React | Lightweight, scalable vector graphics library. |
| **Backend Server** | Node.js / Express.js | Event-driven RESTful API orchestration on port 3001. |
| **Database** | PostgreSQL (Supabase) | Relational SQL persistence with advanced constraints and RPC triggers. |
| **Authentication** | JWT & bcryptjs | Cryptographic security and stateless session management. |

## 4. Testing Credentials

| Access Level | Authentication Email | Password | Role Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Student / Attendee** | `priya@cuchd.in` | `demo123` | Can explore events, register via OTP, and view personal dashboard. |
| **Event Organiser** | `rahul.organiser@gmail.com` | `demo123` | Can create, edit, and delete events, view analytics, and track attendees. |

## 5. Detailed RESTful API Specifications

The following table comprehensively details the primary backend endpoints, identifying the HTTP Method, Route path, expected Request Payload, and Primary Controller Function.

| Method | Endpoint Route | Auth Level | Request Payload (Body) | Expected Output / Action |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ email, password, name, role... }` | Creates user, hashes password, returns JWT session. |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates against bcrypt hash. Returns JWT Token. |
| `GET` | `/api/events` | Public | None | Fetches array of all active, public-facing events. |
| `GET` | `/api/events/:id` | Public | None | Fetches singular event details including capacity and organizer info. |
| `POST` | `/api/events` | Organiser | `{ title, date, venue, capacity... }` | Creates a new event linked to the organiser's account. |
| `POST` | `/api/register/send-otp` | Attendee | `{ eventId, email }` | Generates a 6-digit OTP and sends it via email/console for verification. |
| `POST` | `/api/register/verify-otp`| Attendee | `{ eventId, otp, email }` | Verifies OTP and officially decrements event capacity, creating a Registration. |
| `GET` | `/api/notifications` | Bearer | None | Fetches all notifications for the user, calculates `unreadCount`. |
| `PUT` | `/api/notifications/read-all`| Bearer | None | Marks all fetched notifications as read (`read = 1`). |

## 6. Initialization & Deployment Procedures

To initialize the environment for development or production deployment, execute the following commands in their respective module directories.

### Backend Services Initialization:
```bash
cd backend
npm install
# Set JWT_SECRET, PORT (3001), and Supabase credentials in a .env file prior to execution
npm run dev
# The backend will bind to http://localhost:3001
```

### Frontend Application Initialization:
```bash
cd frontend
npm install
npm run dev
# The application will bind to http://localhost:5173 by default
```

### Database Configuration:
The application relies on Supabase for PostgreSQL management. The complete database schema (including table creation, trigger functions, and mock data injection) is located at `backend/supabase/schema.sql`. You must run this SQL script in your Supabase SQL Editor to initialize the tables before launching the application.
