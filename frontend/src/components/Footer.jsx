import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" style={{ background: 'var(--primary)', color: 'white', padding: '4rem 0 2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div className="nav-logo" style={{ color: 'white', marginBottom: '1rem' }}>
              <span className="inline-flex items-center"><GraduationCap className="w-6 h-6 inline mr-1" /></span> CU <span>Events</span>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '280px' }}>
              The official event management platform for Chandigarh University students and faculty.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1.2rem', fontSize: '1.05rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><Link to="/events" style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Browse Events</Link></li>
              <li><Link to="/calendar" style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Event Calendar</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1.2rem', fontSize: '1.05rem' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><a href="#" style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Help Center</a></li>
              <li><a href="#" style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Contact Us</a></li>
              <li><a href="#" style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>&copy; 2026 Chandigarh University Events. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
