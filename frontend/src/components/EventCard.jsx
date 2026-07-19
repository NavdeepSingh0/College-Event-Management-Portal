import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Heart, Star, Bookmark, ClipboardList, Clock } from 'lucide-react';

export default function EventCard({ event, hideRegister = false, customAction = null }) {
  // Mapping categories to CSS variables for colors
  const categoryColors = {
    'Technical': '#8B5CF6',
    'Cultural': '#EC4899',
    'Academic': '#3B82F6',
    'Sports': '#10B981',
    'Entertainment': '#F59E0B',
    'Career': '#6366F1',
    'Social': '#14B8A6',
    'Competition': '#EF4444'
  };

  // Mapping categories to their respective images
  const categoryImages = {
    'Technical': '/images/categories/technical.png',
    'Cultural': '/images/categories/cultural.png',
    'Sports': '/images/categories/sports.png',
    'Entertainment': '/images/categories/entertainment.png',
    'Academic': '/images/categories/academic.png',
    'Career': '/images/categories/career.png',
    'Social': '/images/categories/social.png',
    'Competition': '/images/categories/competition.png'
  };

  const catColor = categoryColors[event.category] || '#6B7280';
  const catImage = categoryImages[event.category] || '';
  
  // Parse date and time
  let dateObj = new Date();
  try {
    dateObj = new Date(event.date + 'T' + (event.startTime || event.start_time || '09:00'));
  } catch(e) {}
  
  const dateStr = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Calculate seats percentage
  const capacity = event.capacity || 1;
  const registered = event.registered_count || event.registered || 0;
  const pct = Math.round((registered / capacity) * 100);

  // Calculate Registration Deadline (2 days before event date for demo purposes)
  let deadlineDate = new Date(dateObj);
  deadlineDate.setDate(deadlineDate.getDate() - 2);
  const deadlineStr = deadlineDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  return (
    <div className="event-card fade-in" data-id={event.id}>
      <div className="event-card-image" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
        <div 
          className="card-img" 
          style={{ 
            background: `url('${catImage}') center/cover no-repeat, linear-gradient(135deg, ${catColor}44, ${catColor}22)`,
            height: '100%',
            width: '100%',
            backgroundSize: 'cover'
          }}
        >
          <div className="card-img-overlay"></div>
        </div>
        <span className="category-badge" style={{ backgroundColor: catColor }}>
          {event.category}
        </span>
        {event.featured && <span className="featured-badge"><Star className="inline w-3 h-3 mr-1" fill="currentColor" /> Featured</span>}
        <button className="bookmark-btn" title="Save to favorites">
          <Heart className="w-5 h-5 text-secondary " />
        </button>
      </div>
      <div className="event-card-content">
        <div className="event-card-organizer">
          <span className="org-icon"><ClipboardList className="w-4 h-4 text-secondary" /></span> {event.organizer}
        </div>
        <h3>
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <div className="event-card-meta">
          <span><Calendar className="inline w-4 h-4 mr-1 text-tertiary" /> {dateStr} • {timeStr}</span>
          <span><MapPin className="inline w-4 h-4 mr-1 text-tertiary" /> {event.venue || 'TBA'}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock className="w-3 h-3" /> Registration Closes: {deadlineStr}</span>
        </div>
        <div className="seats-bar">
          <div className={`seats-bar-fill ${pct > 80 ? 'almost-full' : ''}`} style={{ width: `${pct}%` }}></div>
        </div>
        
        <div className="event-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="event-card-stats" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="price" style={{ fontSize: '1.2rem', fontWeight: 800, color: event.price === 0 ? 'var(--green)' : 'var(--text)' }}>{event.price === 0 ? 'Free' : `₹${event.price}`}</span>
            <span className="attendance" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{registered}/{capacity} registered</span>
          </div>
          <div className="event-card-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/events/${event.id}`} className="btn btn-sm btn-secondary">View</Link>
            {customAction ? (
              customAction
            ) : (
              !hideRegister && <Link to={`/events/${event.id}`} className="btn btn-sm btn-primary">Register</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
