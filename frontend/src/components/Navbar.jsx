import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Menu, X, GraduationCap } from 'lucide-react';

export default function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="nav-logo">
            <span className="text-primary inline-flex items-center"><GraduationCap className="w-6 h-6 inline mr-1" /></span> CU <span>Events</span>
          </Link>
          <ul className="nav-links">
            <li><Link to="/" className={isActive('/')}>Home</Link></li>
            <li><Link to="/events" className={isActive('/events')}>All Events</Link></li>
            <li><Link to="/calendar" className={isActive('/calendar')}>Calendar</Link></li>
          </ul>
          <div className="nav-actions">
            {!user ? (
              <>
                <button className="btn btn-secondary auth-btn" onClick={() => onOpenAuth('login')}>Login</button>
                <button className="btn btn-primary auth-btn" onClick={() => onOpenAuth('signup')}>Sign Up</button>
              </>
            ) : (
              <>
                <div className="nav-notif" style={{ position: 'relative' }}>
                  <button className="btn-icon">
                    <Bell className="w-5 h-5" />
                    <span className="badge" style={{ display: 'none', position: 'absolute', top: '-5px', right: '-5px', background: 'var(--red)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', alignItems: 'center', justifyContent: 'center' }}>0</span>
                  </button>
                </div>
                <Link to={user.role === 'organiser' ? '/organiser-dashboard' : '/dashboard'} className="btn-icon profile-btn" title="Dashboard">
                  <User className="w-5 h-5" />
                </Link>
                <button className="btn-icon" onClick={logout} title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
            <button className="hamburger" onClick={() => setMobileOpen(true)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}></div>
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setMobileOpen(false)}><X className="w-6 h-6" /></button>
        <ul className="mobile-nav-links">
          <li><Link to="/" onClick={() => setMobileOpen(false)}>Home</Link></li>
          <li><Link to="/events" onClick={() => setMobileOpen(false)}>All Events</Link></li>
          <li><Link to="/calendar" onClick={() => setMobileOpen(false)}>Calendar</Link></li>
          {user && <li><Link to={user.role === 'organiser' ? '/organiser-dashboard' : '/dashboard'} onClick={() => setMobileOpen(false)}>Dashboard</Link></li>}
        </ul>
      </div>
    </>
  );
}
