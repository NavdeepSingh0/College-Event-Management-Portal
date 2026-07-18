import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OrganiserDashboard() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    // Mock fetch
    setMyEvents([
      { id: 1, title: 'Annual Tech Symposium', date: '2026-08-15', registered_count: 230, capacity: 500, views: 1200 },
      { id: 2, title: 'Hackathon 2026', date: '2026-09-10', registered_count: 150, capacity: 200, views: 800 }
    ]);
  }, []);

  if (!user || user.role !== 'organiser') {
    return <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--red)' }}>Access Denied. Organiser role required.</div>;
  }

  return (
    <>
      <div className="page-header" style={{ padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="breadcrumb"><a href="/">Home</a> <span>›</span> <span>Organiser Dashboard</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>Organiser Portal</h1>
              <p>Manage your events, view analytics, and export registrations.</p>
            </div>
            <button className="btn btn-primary btn-lg">
              <Plus className="w-5 h-5 inline" /> Create Event
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Events</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{myEvents.length}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Registrations</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{myEvents.reduce((acc, ev) => acc + ev.registered_count, 0)}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Views</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{myEvents.reduce((acc, ev) => acc + ev.views, 0)}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Manage Events</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--bg)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Event Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Registrations</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Views</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map(event => (
                  <tr key={event.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{event.title}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{new Date(event.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users className="w-4 h-4 text-primary" /> {event.registered_count} / {event.capacity}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{event.views}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button className="btn-icon" style={{ display: 'inline-flex', marginRight: '0.5rem' }} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="btn-icon" style={{ display: 'inline-flex', color: 'var(--red)', borderColor: '#FEE2E2' }} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
