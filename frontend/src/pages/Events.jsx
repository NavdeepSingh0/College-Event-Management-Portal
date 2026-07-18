import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Calendar, Folder, IndianRupee, MapPin } from 'lucide-react';
import EventCard from '../components/EventCard';
import { api } from '../api';

export default function Events() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'all');
  const [priceFilter, setPriceFilter] = useState(searchParams.get('price') || 'all');

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setEvents([
        { id: 1, title: 'Annual Tech Symposium', category: 'Technical', price: 0, date: '2026-08-15', time: '10:00', venue: 'Main Auditorium', capacity: 500, registered_count: 230, poster_url: '/images/tech-symposium.jpg', organizer: 'CU Tech Society' },
        { id: 2, title: 'Cultural Fest 2026', category: 'Cultural', price: 200, date: '2026-09-01', time: '17:00', venue: 'Open Air Theatre', capacity: 1000, registered_count: 450, poster_url: '/images/cultural-fest.jpg', organizer: 'CU Cultural Club' },
        { id: 3, title: 'Startup Pitch Deck', category: 'Academic', price: 50, date: '2026-08-20', time: '14:00', venue: 'Block C Seminar Hall', capacity: 100, registered_count: 85, poster_url: '/images/startup-pitch.jpg', organizer: 'E-Cell CU' }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const clearFilters = () => {
    setSearch('');
    setDateFilter('all');
    setPriceFilter('all');
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb"><a href="/">Home</a> <span>›</span> <span>Events</span></div>
          <h1>All Campus Events</h1>
          <p>Discover and register for events happening at Chandigarh University</p>
        </div>
      </div>

      <div className="container">
        <div className="events-layout">
          {/* SIDEBAR */}
          <aside className="filter-sidebar" id="filterSidebar">
            <div className="filter-card">
              <h3><Search className="inline w-5 h-5 text-primary-500 mb-1" /> Search</h3>
              <div className="form-group" style={{ margin: 0 }}>
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-card">
              <h3><Calendar className="inline w-5 h-5 text-primary-500 mb-1" /> Date</h3>
              <label className="filter-option"><input type="radio" name="dateFilter" value="all" checked={dateFilter === 'all'} onChange={() => setDateFilter('all')} /> All Dates</label>
              <label className="filter-option"><input type="radio" name="dateFilter" value="today" checked={dateFilter === 'today'} onChange={() => setDateFilter('today')} /> Today</label>
              <label className="filter-option"><input type="radio" name="dateFilter" value="week" checked={dateFilter === 'week'} onChange={() => setDateFilter('week')} /> This Week</label>
              <label className="filter-option"><input type="radio" name="dateFilter" value="month" checked={dateFilter === 'month'} onChange={() => setDateFilter('month')} /> This Month</label>
            </div>
            <div className="filter-card">
              <h3><Folder className="inline w-5 h-5 text-primary-500 mb-1" /> Category</h3>
              {['Academic', 'Technical', 'Cultural', 'Sports', 'Entertainment', 'Career', 'Social'].map(cat => (
                <label key={cat} className="filter-option">
                  <input type="checkbox" value={cat} /> {cat}
                </label>
              ))}
            </div>
            <div className="filter-card">
              <h3><IndianRupee className="inline w-5 h-5 text-primary-500 mb-1" /> Price</h3>
              <label className="filter-option"><input type="radio" name="priceFilter" value="all" checked={priceFilter === 'all'} onChange={() => setPriceFilter('all')} /> All</label>
              <label className="filter-option"><input type="radio" name="priceFilter" value="free" checked={priceFilter === 'free'} onChange={() => setPriceFilter('free')} /> Free Only</label>
              <label className="filter-option"><input type="radio" name="priceFilter" value="paid" checked={priceFilter === 'paid'} onChange={() => setPriceFilter('paid')} /> Paid Only</label>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={clearFilters}>Clear All Filters</button>
          </aside>

          {/* MAIN */}
          <main>
            <div className="events-toolbar">
              <span className="events-count">Showing {events.length} events</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: "'Inter', sans-serif" }}>
                  <option value="date">Date (Nearest)</option>
                  <option value="popular">Popularity</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
            
            <div className="events-grid">
              {loading ? (
                [1,2,3].map(i => <div key={i} style={{ height: '300px', background: 'var(--border-light)', borderRadius: '12px' }}></div>)
              ) : (
                events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
