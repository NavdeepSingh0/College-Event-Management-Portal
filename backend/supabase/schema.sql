-- ============================================================
-- CU Events — Supabase Schema v2
-- Role-based system + Open Registration
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- ===== TABLES =====

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cu_id TEXT UNIQUE,                                          -- NULLABLE: external users won't have CU ID
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT,
  year TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'attendee',                                -- 'attendee' | 'organiser'
  organization_name TEXT,                                      -- For organisers
  organization_type TEXT,                                      -- 'university_club' | 'department' | 'external_org' | 'individual'
  college TEXT DEFAULT 'Chandigarh University',                 -- For external participants
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  organizer TEXT,
  organizer_logo TEXT,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  venue TEXT,
  location TEXT DEFAULT 'Chandigarh University, Gharuan',
  price TEXT DEFAULT 'Free',
  capacity INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  description TEXT,
  highlights JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  certificate INTEGER DEFAULT 0,
  speakers JSONB DEFAULT '[]',
  agenda JSONB DEFAULT '[]',
  visibility TEXT DEFAULT 'public',                            -- 'public' | 'cu_only' | 'invite_only'
  allow_external INTEGER DEFAULT 1,                            -- 1 = external users can register
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  uid TEXT,
  email TEXT,
  status TEXT DEFAULT 'confirmed',
  participant_name TEXT,                                       -- For external participants
  participant_college TEXT,                                    -- For external participants
  participant_phone TEXT,                                      -- For external participants
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otps (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  event_id BIGINT,
  user_id BIGINT,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS club_memberships (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id INTEGER NOT NULL,
  club_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);

CREATE TABLE IF NOT EXISTS event_analytics (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id)
);

-- ===== DISABLE RLS (dev mode — server is trusted) =====
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE otps DISABLE ROW LEVEL SECURITY;
ALTER TABLE club_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics DISABLE ROW LEVEL SECURITY;

-- ===== REALTIME =====
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ===== RPC: increment/decrement registered_count atomically =====
CREATE OR REPLACE FUNCTION increment_registered_count(p_event_id BIGINT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE events SET registered_count = registered_count + 1 WHERE id = p_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_registered_count(p_event_id BIGINT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = p_event_id;
END;
$$;

-- ===== RPC: increment event view count =====
CREATE OR REPLACE FUNCTION increment_event_views(p_event_id BIGINT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO event_analytics (event_id, views) VALUES (p_event_id, 1)
  ON CONFLICT (event_id) DO UPDATE SET views = event_analytics.views + 1, updated_at = NOW();
END;
$$;

-- ===== SEED DATA =====

-- Demo attendee user (password: demo123, bcrypt hash)
INSERT INTO users (name, cu_id, email, phone, department, year, password_hash, role, college)
VALUES ('Priya Patel', 'CU2024CSE001', 'priya@cuchd.in', '+91-9876543210', 'CSE', '3rd Year',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'attendee', 'Chandigarh University')
ON CONFLICT (email) DO NOTHING;

-- Demo organiser user (password: demo123, bcrypt hash)
INSERT INTO users (name, cu_id, email, phone, department, password_hash, role, organization_name, organization_type, college)
VALUES ('Rahul Organiser', 'CU2024CSE002', 'rahul.organiser@gmail.com', '+91-9876543211', 'CSE',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'organiser', 'CU Coding Club', 'university_club', 'Chandigarh University')
ON CONFLICT (email) DO NOTHING;

-- Events seed (same as before)
INSERT INTO events (title, category, organizer, organizer_logo, date, start_time, end_time, venue, price, capacity, registered_count, featured, description, highlights, tags, certificate, visibility, allow_external) VALUES
('TechSprint 2026', 'Technical', 'CU ACM Chapter', 'laptop', '2026-07-25', '09:00', '17:00', 'University Auditorium', 'Free', 500, 450, 1, 'Annual hackathon bringing together the brightest minds. Code, create, and compete for prizes worth ₹50,000!', '["36-hour coding challenge","Prizes worth ₹50,000","Mentorship from industry experts","Networking opportunities"]', '["hackathon","coding","tech"]', 1, 'public', 1),
('Annual Cultural Night - Abhivyakti', 'Cultural', 'Cultural Committee', 'masks', '2026-07-28', '18:00', '22:00', 'Open Air Theatre', 'Free', 2000, 1800, 1, 'Experience the magic of CU''s biggest cultural extravaganza featuring dance, music, drama, and more!', '["Live performances","Dance competitions","Music shows","Drama acts"]', '["cultural","dance","music"]', 0, 'public', 1),
('AI & Machine Learning Workshop', 'Academic', 'Department of CSE', 'graduation-cap', '2026-08-01', '10:00', '16:00', 'Innovation Lab, Block C', '₹99', 60, 58, 0, 'Hands-on workshop covering latest AI/ML techniques with industry practitioners.', '["Hands-on projects","Industry experts","Certificate of completion","Free resources"]', '["AI","ML","workshop"]', 1, 'public', 1),
('Inter-College Cricket Tournament', 'Sports', 'Sports Committee', 'club', '2026-08-03', '07:00', '18:00', 'CU Cricket Ground', '₹200 per team', 32, 28, 1, 'Premier cricket tournament featuring 32 teams from across North India.', '["32-team knockout","Professional umpires","Live streaming","Winners trophy"]', '["cricket","sports","tournament"]', 0, 'public', 1),
('Startup Pitch Competition', 'Career', 'CU E-Cell', 'rocket', '2026-08-05', '10:00', '17:00', 'Seminar Hall, Block A', 'Free', 100, 67, 0, 'Pitch your startup idea to a panel of investors and win seed funding!', '["₹5 lakh seed fund","Investor mentoring","Networking lunch","Media coverage"]', '["startup","business","pitch"]', 1, 'public', 1),
('Photography Walk — Heritage Chandigarh', 'Entertainment', 'CU Photography Club', 'camera', '2026-08-08', '06:00', '12:00', 'Meeting: CU Main Gate', '₹150', 40, 35, 0, 'Explore Chandigarh''s architectural heritage through the lens.', '["Expert guidance","Portfolio review","Photo exhibition","Breakfast included"]', '["photography","heritage","outdoor"]', 0, 'public', 1),
('International Yoga Day Celebration', 'Sports', 'NSS Unit CU', 'heart', '2026-08-10', '06:00', '08:00', 'CU Sports Complex', 'Free', 500, 234, 0, 'Join us for a morning of wellness and mindfulness.', '["Professional yoga instructors","Free yoga mats","Herbal refreshments","Wellness kits"]', '["yoga","wellness","health"]', 1, 'public', 1),
('Model United Nations (MUN)', 'Academic', 'CU Debate Society', 'landmark', '2026-08-12', '09:00', '18:00', 'Conference Hall, Block B', '₹300', 150, 120, 1, 'Simulate UN committees and debate pressing global issues.', '["6 committees","Best delegate awards","Guest speakers","Networking dinner"]', '["MUN","debate","politics"]', 1, 'cu_only', 0),
('Web Development Bootcamp', 'Technical', 'CU Coding Club', 'laptop', '2026-08-15', '09:00', '17:00', 'Computer Lab 3, Block D', '₹149', 50, 45, 0, 'Intensive full-stack web development bootcamp.', '["Full-stack curriculum","Build real projects","Career guidance","Certificate"]', '["webdev","javascript","fullstack"]', 1, 'public', 1),
('Classical Music Night — Raag Rang', 'Cultural', 'CU Music Society', 'music', '2026-08-18', '19:00', '22:00', 'Auditorium', 'Free', 800, 456, 0, 'An evening of Indian classical music.', '["Guest artists","Student performances","Acoustic setting","Live streaming"]', '["music","classical","concert"]', 0, 'public', 1),
('Robotics Competition — BotWars', 'Competition', 'Robotics Club CU', 'bot', '2026-08-20', '10:00', '18:00', 'Innovation Hub', '₹500 per team', 40, 36, 1, 'Build battle-ready robots and compete!', '["₹25,000 prize pool","Workshop day","Industry judges","Live broadcast"]', '["robotics","competition","engineering"]', 1, 'public', 1),
('Career Fair 2026', 'Career', 'Placement Cell', 'briefcase', '2026-08-22', '09:00', '16:00', 'CU Convention Centre', 'Free', 1000, 780, 1, 'Connect with 50+ top companies.', '["50+ companies","On-spot interviews","Resume workshop","Panel discussions"]', '["career","jobs","placement"]', 0, 'public', 1),
('Stand-Up Comedy Night', 'Entertainment', 'CU Entertainment Club', 'smile', '2026-08-24', '19:00', '21:00', 'Open Air Theatre', '₹100', 300, 245, 0, 'An evening of laughter!', '["3 professional comedians","Open mic slots","Food stalls","Meet & greet"]', '["comedy","entertainment","standup"]', 0, 'public', 1),
('Cybersecurity CTF Challenge', 'Technical', 'InfoSec Club', 'shield', '2026-08-25', '10:00', '22:00', 'Cyber Lab, Block E', 'Free', 80, 72, 0, 'Capture The Flag competition.', '["12-hour challenge","Real-world scenarios","Prizes worth ₹15,000","Expert mentors"]', '["cybersecurity","CTF","hacking"]', 1, 'public', 1),
('Annual Fresher''s Party — Induction 2026', 'Social', 'Student Council', 'party-popper', '2026-08-27', '18:00', '23:00', 'CU Grand Hall', 'Free (Freshers)', 1500, 1200, 1, 'The most anticipated event for new students!', '["DJ Night","Mr. & Ms. Fresher","Dance performances","Free dinner"]', '["fresher","party","social"]', 0, 'cu_only', 0),
('TEDxCU — Ideas Worth Spreading', 'Academic', 'TEDxCU Team', 'mic', '2026-08-14', '10:00', '17:00', 'CU Auditorium', '₹249', 300, 280, 1, 'TEDxCU brings together innovators and thought leaders.', '["8 speakers","Networking lunch","Swag kit","Premium experience"]', '["TEDx","talks","inspiration"]', 1, 'public', 1),
('Blockchain & Web3 Meetup', 'Technical', 'CU Blockchain Club', 'link', '2026-08-16', '14:00', '17:00', 'Innovation Lab', 'Free', 60, 42, 0, 'Learn about blockchain and the future of decentralized web.', '["Live coding","DApp demo","NFT workshop","Community networking"]', '["blockchain","web3","crypto"]', 0, 'public', 1);

-- Welcome notifications for demo users
INSERT INTO notifications (user_id, message, type)
SELECT id, 'Welcome to CU Events! Start exploring events.', 'info'
FROM users WHERE email = 'priya@cuchd.in';

INSERT INTO notifications (user_id, message, type)
SELECT id, 'Welcome to CU Events Organiser Panel! Create your first event.', 'success'
FROM users WHERE email = 'rahul.organiser@gmail.com';
