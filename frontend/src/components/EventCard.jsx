import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

export default function EventCard({ event }) {
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

  return (
    <div className="event-card fade-in" data-id={event.id}>
      <div className="event-card-image">
        <div 
          className="card-img" 
          style={{ 
            background: `url('${catImage}') center/cover no-repeat, linear-gradient(135deg, ${catColor}44, ${catColor}22)`
          }}
        >
          <div className="card-img-overlay"></div>
        </div>
        <span className="category-badge" style={{ backgroundColor: catColor }}>
          {event.category}
        </span>
        {event.featured && <span className="featured-badge">⭐ Featured</span>}
        <button className="bookmark-btn" title="Save to favorites">
          🤍
        </button>
      </div>
      <div className="event-card-content">
        <div className="event-card-organizer">
          <span className="org-icon">{event.organizerLogo || event.organizer_logo || '📋'}</span> {event.organizer}
        </div>
        <h3>
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <div className="event-card-meta">
          <span>📅 {dateStr} • {timeStr}</span>
          <span>📍 {event.venue || 'TBA'}</span>
        </div>
        
        <div className="seats-bar">
          <div className={`seats-bar-fill ${pct > 80 ? 'almost-full' : ''}`} style={{ width: `${pct}%` }}></div>
        </div>
        
        <div className="event-card-footer">
          <div className="event-card-stats">
            <span className="attendance">{registered}/{capacity} registered</span>
            <span className="price">{event.price === 0 ? 'Free' : event.price}</span>
          </div>
          <div className="event-card-actions">
            <Link to={`/events/${event.id}`} className="btn btn-sm btn-secondary">View</Link>
            <button className="btn btn-sm btn-primary">Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}
