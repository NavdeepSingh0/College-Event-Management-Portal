import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Star, Calendar, Target, Users, Rocket, MessageSquare, Mail, GraduationCap, Laptop, Palette, Trophy, Briefcase, Handshake, Mic, Theater, Bot, Clapperboard, Camera, Music, Edit, Medal, Dumbbell } from 'lucide-react';
import EventCard from '../components/EventCard';
import { cuEvents, cuClubs, testimonials } from '../data/events';

const iconMap = {
  'laptop': <Laptop className="w-8 h-8" />,
  'masks': <Theater className="w-8 h-8" />,
  'bot': <Bot className="w-8 h-8" />,
  'clapperboard': <Clapperboard className="w-8 h-8" />,
  'rocket': <Rocket className="w-8 h-8" />,
  'camera': <Camera className="w-8 h-8" />,
  'music': <Music className="w-8 h-8" />,
  'handshake': <Handshake className="w-8 h-8" />,
  'edit': <Edit className="w-8 h-8" />,
  'medal': <Medal className="w-8 h-8" />
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [bookState, setBookState] = useState(0);

  // Live Ticker Logic: Next event
  const sortedByDate = [...cuEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextEvent = sortedByDate.find(e => new Date(e.date) >= new Date()) || sortedByDate[0];
  let nextEventText = "Loading...";
  if (nextEvent) {
    const d = new Date(nextEvent.date + 'T' + (nextEvent.startTime || '09:00'));
    nextEventText = `Next: ${nextEvent.title} - ${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  const featuredEvents = cuEvents.filter(e => e.featured).slice(0, 6);
  const upcomingEvents = sortedByDate.slice(0, 6);

  const categories = [
    { name: 'Academic & Seminars', icon: <GraduationCap className="w-8 h-8" />, desc: 'Guest lectures, workshops, research', cat: 'Academic' },
    { name: 'Technical & IT', icon: <Laptop className="w-8 h-8" />, desc: 'Hackathons, coding, tech talks', cat: 'Technical' },
    { name: 'Cultural & Arts', icon: <Palette className="w-8 h-8" />, desc: 'Music, dance, drama, exhibitions', cat: 'Cultural' },
    { name: 'Sports & Fitness', icon: <Dumbbell className="w-8 h-8" />, desc: 'Tournaments, yoga, sports meets', cat: 'Sports' },
    { name: 'Entertainment', icon: <Mic className="w-8 h-8" />, desc: 'Concerts, comedy, DJ nights', cat: 'Entertainment' },
    { name: 'Career & Placements', icon: <Briefcase className="w-8 h-8" />, desc: 'Job fairs, mock interviews', cat: 'Career' },
    { name: 'Social & Community', icon: <Handshake className="w-8 h-8" />, desc: 'Blood donation, NGO drives', cat: 'Social' },
    { name: 'Competitions', icon: <Trophy className="w-8 h-8" />, desc: 'Debates, quizzes, case studies', cat: 'Competition' }
  ];

  // Hero carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBookState(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getBookClass = (index) => {
    let diff = index - bookState;
    if (diff < 0) diff += 4;
    if (diff === 0) return 'state-1';
    if (diff === 1) return 'state-2';
    if (diff === 2) return 'state-3';
    return 'state-hidden';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/events?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleChipClick = (query) => navigate(`/events?${query}`);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to<br />Chandigarh University<br /><span className="highlight">Events Hub</span></h1>
            <p>Discover, Register, and Experience the Best of Campus Life at CU. Never miss an exciting event again!</p>
            <div className="hero-actions">
              <Link to="/events" className="btn btn-primary btn-lg">Explore Events</Link>
            </div>
            <div className="hero-ticker">
              <span className="live-dot"></span>
              <span>{nextEventText}</span>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Events This Year</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">30000+</div>
                <div className="stat-label">Active Students</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Clubs & Societies</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">Campus Venues</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-book-stack" onClick={() => setBookState(prev => (prev + 1) % 4)} style={{ cursor: 'pointer' }}>
              <div className={`book-page ${getBookClass(0)}`} style={{ backgroundImage: "url('/assets/hero-campus.jpg')" }}></div>
              <div className={`book-page ${getBookClass(1)}`} style={{ backgroundImage: "url('https://www.orchidfoundation.info/sites/default/files/2021-01/Chandigarh%20University_0.png')" }}></div>
              <div className={`book-page ${getBookClass(2)}`} style={{ backgroundImage: "url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhyUnbf5PQ3auuIgTR96i3a9M5tmwowAdiwdS5ZlofHrlM6BV3b911LWGlsQK5tqxHTZVqeVeGlzVZCcSiwocQCSaw7a3xGfW-1MaPTWUcPx0ghI6accd5I6uBXrThPna6K8pbq9yEoq1eKX1VXc_d1Kr2Rid0XW4ftgQxyBgFN_yakzKPuyZa1N7mnxww/s16000-rw/Chandigarh%20University%20private%20university%20in%20Punjab.jpg')" }}></div>
              <div className={`book-page ${getBookClass(3)}`} style={{ backgroundImage: "url('https://static.boostmytalent.com/img/univ/chandigarh-university-cu-mohali-campus-admission.webp')" }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="search-section">
        <div className="container">
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search events, clubs, organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="filter-chips">
            <span className="chip" onClick={() => handleChipClick('date=today')}>Today</span>
            <span className="chip" onClick={() => handleChipClick('date=week')}>This Week</span>
            <span className="chip" onClick={() => handleChipClick('price=free')}>Free Events</span>
            <span className="chip" onClick={() => handleChipClick('cat=Technical')}>Technical</span>
            <span className="chip" onClick={() => handleChipClick('cat=Cultural')}>Cultural</span>
            <span className="chip" onClick={() => handleChipClick('cat=Entertainment')}>Entertainment</span>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2><Star className="inline w-8 h-8 text-yellow-500 mb-1" /> Featured Events</h2>
            <p>Don't miss these handpicked highlights from Chandigarh University</p>
          </div>
          <div className="events-grid">
            {featuredEvents.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2><Calendar className="inline w-8 h-8 text-blue-500 mb-1" /> Upcoming Events</h2>
            <p>What's happening at CU this week</p>
          </div>
          <div className="events-grid">
            {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/events" className="btn btn-primary btn-lg">View All Events →</Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2><Target className="inline w-8 h-8 text-red-500 mb-1" /> Explore by Category</h2>
            <p>Find events that match your interests</p>
          </div>
          <div className="categories-grid">
            {categories.map(cat => {
              const count = cuEvents.filter(e => e.category === cat.cat).length;
              return (
                <Link to={`/events?cat=${cat.cat}`} key={cat.cat} className="category-card fade-in">
                  <span className="cat-icon text-accent">{cat.icon}</span>
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                  <p style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{count} events</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLUBS SPOTLIGHT */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2><Users className="inline w-8 h-8 text-green-500 mb-1" /> CU Clubs & Societies</h2>
            <p>Join 150+ active clubs at Chandigarh University</p>
          </div>
          <div className="clubs-scroll">
            {cuClubs.map(club => (
              <div key={club.id} className="club-card">
                <div className="club-icon text-accent">{iconMap[club.logo] || <Users className="w-8 h-8" />}</div>
                <h3>{club.name}</h3>
                <div className="club-meta">{club.members} members • {club.upcomingEvents} events</div>
                <button className="btn btn-sm btn-primary" onClick={() => alert(`Following ${club.name}!`)}>Follow</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2><Rocket className="inline w-8 h-8 text-purple-500 mb-1" /> How It Works</h2>
            <p>Get started in 4 simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <h3>Browse Events</h3>
              <p>Explore hundreds of campus events across all categories</p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">2</div>
              <h3>Register Instantly</h3>
              <p>One-click registration with your CU ID</p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">3</div>
              <h3>Get Notified</h3>
              <p>Receive reminders and event updates</p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">4</div>
              <h3>Check-in & Attend</h3>
              <p>QR code-based contactless entry at events</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2><MessageSquare className="inline w-8 h-8 text-pink-500 mb-1" /> What CU Students Say</h2>
            <p>Hear from our vibrant community</p>
          </div>
          <div className="testimonials-slider">
            {testimonials.map(t => (
              <div key={t.id} className="testimonial-card">
                <div className="stars flex gap-1 mb-3 text-yellow-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4" fill="currentColor" />
                  ))}
                </div>
                <p className="quote">"{t.quote}"</p>
                <div className="author">
                  <div className="author-avatar">{t.name.charAt(0)}</div>
                  <div className="author-info">
                    <h4>{t.name}</h4>
                    <p>{t.department}, {t.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="slide-up">
              <div className="stat-value">5000+</div>
              <div className="stat-desc">Events Hosted</div>
            </div>
            <div className="slide-up">
              <div className="stat-value">28000+</div>
              <div className="stat-desc">Active Students</div>
            </div>
            <div className="slide-up">
              <div className="stat-value">150+</div>
              <div className="stat-desc">Campus Organizations</div>
            </div>
            <div className="slide-up">
              <div className="stat-value">4.8/5</div>
              <div className="stat-desc">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section">
        <div className="container">
          <div className="newsletter">
            <h2><Mail className="inline w-8 h-8 text-blue-400 mb-1" /> Never Miss an Event</h2>
            <p>Subscribe to get weekly event digests straight to your inbox</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
              <input type="email" placeholder="Enter your CU email" required />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
