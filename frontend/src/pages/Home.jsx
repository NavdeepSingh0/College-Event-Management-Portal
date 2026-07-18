import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Star, Calendar, Target, Users, Rocket, MessageSquare, Mail } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleChipClick = (query) => {
    navigate(`/events?${query}`);
  };

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
              <span>Next Event Loading...</span>
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
            <div className="hero-book-stack">
              <div className="book-page state-1" style={{ backgroundImage: "url('/assets/hero-campus.jpg')" }}></div>
              <div className="book-page state-2" style={{ backgroundImage: "url('https://www.orchidfoundation.info/sites/default/files/2021-01/Chandigarh%20University_0.png')" }}></div>
              <div className="book-page state-3" style={{ backgroundImage: "url('https://static.boostmytalent.com/img/univ/chandigarh-university-cu-mohali-campus-admission.webp')" }}></div>
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
            {/* We will map featured events here. For now, just rendering a placeholder card using original HTML structure */}
            <div className="event-card">
              <div className="event-card-image">
                <div className="card-img" style={{ backgroundImage: "url('/images/tech-symposium.jpg')" }}>
                  <div className="card-img-overlay"></div>
                </div>
                <span className="category-badge" style={{ backgroundColor: 'var(--cat-technical)' }}>Technical</span>
                <span className="featured-badge">Featured</span>
              </div>
              <div className="event-card-content">
                <div className="event-card-organizer">
                  <span>Organized by <strong>CU Tech Society</strong></span>
                </div>
                <h3 className="event-title">Annual Tech Symposium</h3>
                <div className="event-meta">
                  <span><Calendar className="w-4 h-4 inline" /> Aug 15, 2026</span>
                  <span><Users className="w-4 h-4 inline" /> 500 spots</span>
                </div>
                <div className="event-card-footer">
                  <span className="event-price free">Free</span>
                  <Link to="/events/1" className="btn btn-sm btn-primary">Register</Link>
                </div>
              </div>
            </div>
            
            <div className="event-card">
              <div className="event-card-image">
                <div className="card-img" style={{ backgroundImage: "url('/images/cultural-fest.jpg')" }}>
                  <div className="card-img-overlay"></div>
                </div>
                <span className="category-badge" style={{ backgroundColor: 'var(--cat-cultural)' }}>Cultural</span>
              </div>
              <div className="event-card-content">
                <div className="event-card-organizer">
                  <span>Organized by <strong>CU Cultural Club</strong></span>
                </div>
                <h3 className="event-title">Cultural Fest 2026</h3>
                <div className="event-meta">
                  <span><Calendar className="w-4 h-4 inline" /> Sep 1, 2026</span>
                  <span><Users className="w-4 h-4 inline" /> 1000 spots</span>
                </div>
                <div className="event-card-footer">
                  <span className="event-price">₹200</span>
                  <Link to="/events/2" className="btn btn-sm btn-primary">Register</Link>
                </div>
              </div>
            </div>

             <div className="event-card">
              <div className="event-card-image">
                <div className="card-img" style={{ backgroundImage: "url('/images/startup-pitch.jpg')" }}>
                  <div className="card-img-overlay"></div>
                </div>
                <span className="category-badge" style={{ backgroundColor: 'var(--cat-academic)' }}>Entrepreneurship</span>
              </div>
              <div className="event-card-content">
                <div className="event-card-organizer">
                  <span>Organized by <strong>E-Cell CU</strong></span>
                </div>
                <h3 className="event-title">Startup Pitch Deck</h3>
                <div className="event-meta">
                  <span><Calendar className="w-4 h-4 inline" /> Aug 20, 2026</span>
                  <span><Users className="w-4 h-4 inline" /> 100 spots</span>
                </div>
                <div className="event-card-footer">
                  <span className="event-price">₹50</span>
                  <Link to="/events/3" className="btn btn-sm btn-primary">Register</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2><Rocket className="inline w-8 h-8 text-purple-500 mb-1" /> How It Works</h2>
            <p>Get started in 4 simple steps</p>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div className="step-card fade-in" style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div className="step-number" style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>1</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Browse Events</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Explore hundreds of campus events across all categories</p>
            </div>
            <div className="step-card fade-in" style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div className="step-number" style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>2</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Register Instantly</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>One-click registration with your CU ID</p>
            </div>
            <div className="step-card fade-in" style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div className="step-number" style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>3</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Get Notified</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Receive reminders and event updates</p>
            </div>
            <div className="step-card fade-in" style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div className="step-number" style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>4</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Check-in & Attend</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>QR code-based contactless entry at events</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="section">
        <div className="container">
          <div className="newsletter" style={{ background: 'var(--primary)', color: 'white', padding: '4rem', borderRadius: '24px', textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}><Mail className="inline w-8 h-8 text-blue-400 mb-1" /> Never Miss an Event</h2>
            <p style={{ color: '#9CA3AF', marginBottom: '2rem' }}>Subscribe to get weekly event digests straight to your inbox</p>
            <form className="newsletter-form" style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }} onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
              <input type="email" placeholder="Enter your CU email" required style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '12px', border: 'none', outline: 'none' }} />
              <button type="submit" className="btn btn-accent" style={{ borderRadius: '12px', padding: '0.8rem 1.5rem' }}>Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
