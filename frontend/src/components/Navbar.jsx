import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Menu, X, GraduationCap } from 'lucide-react';
import API from '../utils/api';

export default function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (!user) return;
      try {
        const res = await API.get('/notifications');
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifs();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

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
                  <button className="btn-icon" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--red)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifDropdown && (
                    <div style={{ position: 'absolute', top: '120%', right: '0', width: '300px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border)', zIndex: 1000, overflow: 'hidden' }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
                        )}
                      </div>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No notifications yet.</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', background: n.read === 0 ? '#f0f9ff' : 'white' }}>
                              <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--text)' }}>{n.message}</p>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
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
