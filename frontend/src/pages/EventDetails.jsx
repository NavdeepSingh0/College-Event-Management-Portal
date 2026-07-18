import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setEvent({
        id,
        title: 'Annual Tech Symposium',
        description: 'Join us for the biggest tech event of the year featuring keynote speakers, hackathons, and networking sessions.',
        category: 'Technical',
        price: 0,
        date: '2026-08-15',
        time: '10:00',
        venue: 'Main Auditorium',
        capacity: 500,
        registered_count: 230,
        poster_url: '/images/tech-symposium.jpg',
        organizer: 'CU Tech Society'
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Loading...</div>;
  if (!event) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Event not found</div>;

  return (
    <>
      <div className="page-header" style={{ padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Home</a> <span>›</span> <a href="/events">Events</a> <span>›</span> <span>{event.title}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '400px', width: '100%', background: `url('${event.poster_url}') center/cover no-repeat` }}></div>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <span className="category-badge" style={{ position: 'relative', top: 0, left: 0, backgroundColor: 'var(--cat-technical)' }}>{event.category}</span>
              </div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{event.title}</h1>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{event.description}</p>
            </div>
          </div>

          <div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Event Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{new Date(event.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.time}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Venue</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.venue}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Availability</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.capacity - event.registered_count} seats left</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Price</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: event.price === 0 ? 'var(--green)' : 'var(--text)' }}>
                  {event.price === 0 ? 'Free' : `₹${event.price}`}
                </span>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                <Ticket className="w-5 h-5" /> Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
