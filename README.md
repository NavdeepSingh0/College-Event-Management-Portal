# College Event Portal - 12 Hour Challenge

A modern, full-stack college event management portal built for the 12-Hour Challenge. This platform enables students to discover and register for events, and allows organizers to seamlessly manage them.

## 🚀 Tech Stack

- **Frontend:** React (Vite), TailwindCSS, React Router DOM, Lucide React Icons
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT, bcryptjs

## 🌟 Features Implemented

### Core Requirements
1. **Authentication:** Secure student login/registration, encrypted passwords, JWT sessions, and protected routes.
2. **Student Dashboard:** Responsive UI for students to view registered events, cancel registrations, and view organizer announcements.
3. **Event Listing:** Detailed event cards/pages featuring banners, dates, venues, capacities, and a seamless registration flow.
4. **Admin Panel:** Organiser dashboard to create, edit, delete events, track views, and manage registrations.
5. **Database Design:** A fully relational schema in Supabase handling Users, Events, Registrations, and Announcements.

### Bonus Features (Highly Preferred)
- **Email Confirmations:** Integrated SMTP for OTP-based secure actions.
- **Search & Filters:** A comprehensive sidebar on the events page to filter by category, date, and text search.
- **Calendar View:** A visual calendar allowing students to browse events chronologically.
- **Analytics Dashboard:** Event views and registration metrics tracked and displayed to organizers.
- **Responsive Mobile UI:** Built mobile-first using Tailwind CSS.
- **Loading Skeletons:** Skeleton loaders to ensure a smooth user experience during data fetching.

## 🛠️ Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Run the SQL commands found in `backend/supabase/schema.sql` in your Supabase SQL editor.
3. Run the `backend/supabase/migrate.sql` script to seed dummy data.
4. Note your Supabase URL and Anon Key.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_super_secret_jwt_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```
Run the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Run the React development server:
```bash
npm run dev
```

## 🏗️ Architecture Decisions
- **Separation of Concerns:** The project is strictly divided into a decoupled `/backend` (REST API) and `/frontend` (React SPA). This allows them to be deployed and scaled independently.
- **Supabase as DBaaS:** PostgreSQL on Supabase was chosen for its robust relational data integrity and ease of remote connection without complex local setup.
- **Vite over Create React App:** Vite was chosen for its incredibly fast HMR (Hot Module Replacement) and optimized build times, crucial for a 12-hour hackathon environment.
- **Tailwind CSS:** Selected to rapidly build responsive, modern, and highly customized UI components without context-switching to external CSS files.
