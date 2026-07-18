import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Bookmark } from 'lucide-react';

export default function EventCard({ event }) {
  // Mapping categories to CSS variables
  const categoryColors = {
    'Technical': 'var(--cat-technical)',
    'Cultural': 'var(--cat-cultural)',
    'Academic': 'var(--cat-academic)',
    'Sports': 'var(--cat-sports)',
    'Entertainment': 'var(--cat-entertainment)',
    'Career': 'var(--cat-career)',
    'Social': 'var(--cat-social)',
    'Competition': 'var(--cat-competition)'
  };

  const bgColor = categoryColors[event.category] || 'var(--accent)';

  return (
    <div className="event-card">
      <div className="event-card-image">
        <div className="card-img" style={{ backgroundImage: `url('${event.poster_url || '/images/placeholder.jpg'}')` }}>
          <div className="card-img-overlay"></div>
        </div>
        <span className="category-badge" style={{ backgroundColor: bgColor }}>
          {event.category}
        </span>
        <button className="bookmark-btn" title="Save Event">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
      <div className="event-card-content">
        <div className="event-card-organizer">
          <span>Organized by <strong>{event.organizer || 'CU Society'}</strong></span>
        </div>
        <h3 className="event-title">{event.title}</h3>
        <div className="event-meta">
          <span><Calendar className="w-4 h-4 inline" /> {new Date(event.date).toLocaleDateString()}</span>
          <span><Users className="w-4 h-4 inline" /> {event.capacity} spots</span>
        </div>
        <div className="event-card-footer">
          <span className={`event-price ${event.price === 0 ? 'free' : ''}`}>
            {event.price === 0 ? 'Free' : `₹${event.price}`}
          </span>
          <Link to={`/events/${event.id}`} className="btn btn-sm btn-primary">Register</Link>
        </div>
      </div>
    </div>
  );
}
