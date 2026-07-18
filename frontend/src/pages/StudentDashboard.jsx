import React, { useState, useEffect } from 'react';
import { Calendar, Bell, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Mock fetch
    setRegisteredEvents([
      { id: 1, title: 'Annual Tech Symposium', category: 'Technical', price: 0, date: '2026-08-15', time: '10:00', venue: 'Main Auditorium', capacity: 500, registered_count: 230, poster_url: '/images/tech-symposium.jpg' }
    ]);
    setAnnouncements([
      { id: 1, title: 'Venue Changed for Tech Symposium', message: 'The event has been moved to the Main Auditorium.', date: '2026-08-10' }
    ]);
  }, []);

  if (!user) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Please login to view your dashboard.</div>;

  return (
    <>
      <div className="page-header" style={{ padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> <span>›</span> <span>Student Dashboard</span></div>
          <h1>Welcome, {user.name}</h1>
          <p>Manage your event registrations and notifications</p>
        </div>
      </div>

      <div className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar className="w-6 h-6 text-primary-500" /> My Registered Events
              </h2>
              {registeredEvents.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg)', borderRadius: '12px' }}>
                  <p>You haven't registered for any events yet.</p>
                  <Link to="/events" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Events</Link>
                </div>
              ) : (
                <div className="events-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {registeredEvents.map(event => (
                    <div key={event.id} style={{ position: 'relative' }}>
                      <EventCard event={event} />
                      <button className="btn-icon" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'var(--red)', color: 'white', border: 'none' }} title="Cancel Registration">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell className="w-6 h-6 text-yellow-500" /> Announcements
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{ann.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{ann.message}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{ann.date}</span>
                  </div>
                ))}
                {announcements.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No new announcements.</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
