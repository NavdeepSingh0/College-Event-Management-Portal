import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, Clock, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../utils/api';

// Map categories to original CSS variables/colors
const categoryColors = {
  Academic: '#3B82F6',
  Technical: '#8B5CF6',
  Cultural: '#EC4899',
  Sports: '#10B981',
  Entertainment: '#F59E0B',
  Career: '#6366F1',
  Social: '#14B8A6',
  Competition: '#EF4444'
};

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Start with today selected
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  
  const [events, setEvents] = useState([]);

  React.useEffect(() => {
    API.get('/events?limit=500')
      .then(res => setEvents(res.events || []))
      .catch(err => console.error(err));
  }, []);

  const calYear = currentDate.getFullYear();
  const calMonth = currentDate.getMonth();

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(calYear, calMonth + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const monthEvents = useMemo(() => {
    return events.filter(e => {
      if (!e.date) return false;
      const [y, m] = e.date.split('-');
      return parseInt(y) === calYear && parseInt(m) === calMonth + 1;
    });
  }, [calYear, calMonth, events]);

  const selectedEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDateStr);
  }, [selectedDateStr, events]);

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  const renderCells = () => {
    const cells = [];
    
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="cal-day-cell cal-day-cell--empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = monthEvents.filter(e => e.date === dateStr);
      const isToday = dateStr === todayStr;
      const isPast = new Date(dateStr) < new Date(todayStr);
      const hasEvents = dayEvents.length > 0;
      const isSelected = selectedDateStr === dateStr;

      let cellClass = 'cal-day-cell';
      if (isToday) cellClass += ' cal-day-cell--today';
      if (hasEvents) cellClass += ' cal-day-cell--has-events';
      if (isPast) cellClass += ' cal-day-cell--past';
      if (isSelected) cellClass += ' cal-day-cell--selected';

      cells.push(
        <div 
          key={d} 
          className={cellClass}
          onClick={() => setSelectedDateStr(dateStr)}
        >
          <div className="cal-day-number">{d}</div>
          <div className="cal-day-events">
            {dayEvents.slice(0, 2).map((e, idx) => (
              <div key={idx} className="cal-event-chip" style={{ '--chip-color': categoryColors[e.category] || '#6B7280' }} title={e.title}>
                <span className="cal-event-chip__dot" style={{ background: categoryColors[e.category] || '#6B7280' }}></span>
                <span className="cal-event-chip__title">{e.title}</span>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="cal-event-more">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    return cells;
  };

  const selectedDateObj = new Date(selectedDateStr + 'T00:00:00');
  const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> <span>›</span> <span>Calendar</span></div>
          <h1><CalendarIcon className="inline w-8 h-8 text-primary-500 mb-1" /> Event Calendar</h1>
          <p>View all campus events — click any date to see details</p>
        </div>
      </div>

      <div className="container" style={{ marginBottom: '4rem' }}>
        <div className="calendar-layout">
          <div className="calendar-container">
            <div className="calendar-header">
              <div className="calendar-header__left">
                <button className="btn-icon cal-nav-btn" onClick={prevMonth} title="Previous month"><ChevronLeft className="w-5 h-5" /></button>
                <h2>{months[calMonth]} {calYear}</h2>
                <button className="btn-icon cal-nav-btn" onClick={nextMonth} title="Next month"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="calendar-header__right">
                <span className="calendar-month-summary">
                  <span className="month-summary-count">{monthEvents.length}</span> event{monthEvents.length !== 1 ? 's' : ''} in {months[calMonth]}
                </span>
                <button className="btn btn-sm btn-secondary" onClick={goToToday}>Today</button>
              </div>
            </div>
            
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="cal-day-header">{d}</div>
              ))}
              {renderCells()}
            </div>
            
            <div className="calendar-legend">
              <span className="calendar-legend__label">Categories:</span>
              {Object.entries(categoryColors).map(([cat, color]) => (
                <span key={cat} className="calendar-legend__item">
                  <span className="calendar-legend__dot" style={{ background: color }}></span>{cat}
                </span>
              ))}
            </div>
          </div>
          
          <aside className="calendar-sidebar-events">
            <h3 className="cal-sidebar-date" style={{ fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>{selectedDateFormatted}</h3>
            <div id="dateEvents">
              {selectedEvents.length === 0 ? (
                <div className="cal-sidebar-empty">
                  <div className="cal-sidebar-empty__icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><CalendarIcon className="w-12 h-12 text-slate-300" /></div>
                  <p>No events on this date</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Try selecting a date with event indicators</span>
                </div>
              ) : (
                <>
                  <div className="cal-sidebar-count" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</div>
                  {selectedEvents.map(e => {
                    const catColor = categoryColors[e.category] || '#6B7280';
                    const pct = Math.round(((e.registered_count || e.registered || 0) / (e.capacity || 1)) * 100);
                    return (
                      <div key={e.id} className="cal-event-card" style={{ '--event-color': catColor }}>
                        <div className="cal-event-card__accent" style={{ background: catColor }}></div>
                        <div className="cal-event-card__body">
                          <div className="cal-event-card__category" style={{ color: catColor }}>{e.category}</div>
                          <h4 className="cal-event-card__title"><Link to={`/events/${e.id}`}>{e.title}</Link></h4>
                          <div className="cal-event-card__meta">
                            <span><Clock className="inline w-3 h-3 mr-1" /> {e.time || e.startTime || e.start_time || 'TBA'}</span>
                            <span><MapPin className="inline w-3 h-3 mr-1" /> {e.venue || 'TBA'}</span>
                          </div>
                          <div className="cal-event-card__organizer">
                            <span className="cal-event-card__org-logo"><ClipboardList className="w-3 h-3 text-gray-500 inline mr-1" /></span>
                            <span>{e.organizer}</span>
                          </div>
                          <div className="cal-event-card__footer">
                            <div className="cal-event-card__seats">
                              <div className="cal-event-card__seats-bar">
                                <div className="cal-event-card__seats-fill" style={{ width: `${pct}%`, background: pct > 80 ? '#ef4444' : catColor }}></div>
                              </div>
                              <span>{e.registered_count || e.registered || 0}/{e.capacity} spots</span>
                            </div>
                            <span className="cal-event-card__price">{e.price === 0 ? 'Free' : (e.price || 'Free')}</span>
                          </div>
                          <div className="cal-event-card__actions">
                            <Link to={`/events/${e.id}`} className="btn btn-sm btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Details</Link>
                            <button className="btn btn-sm btn-primary" style={{ flex: 1 }}>Register</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
