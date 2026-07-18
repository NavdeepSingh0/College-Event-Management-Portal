import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Calendar, Folder, IndianRupee, MapPin } from 'lucide-react';
import EventCard from '../components/EventCard';
import { cuVenues } from '../data/events';
import API from '../utils/api';

export default function Events() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/events?limit=100')
      .then(res => {
        setAllEvents(res.events || []);
      })
      .catch(err => console.error(err));
  }, []);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'all');
  const [priceFilter, setPriceFilter] = useState(searchParams.get('price') || 'all');
  const [venueFilter, setVenueFilter] = useState('');
  
  // Multiple categories can be selected
  const [selectedCats, setSelectedCats] = useState([]);
  
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    // Initial cat filter from URL if present
    const urlCat = searchParams.get('cat');
    if (urlCat && !selectedCats.includes(urlCat)) {
      setSelectedCats([urlCat]);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    // Apply filters
    let filtered = [...allEvents];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.organizer.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);

      filtered = filtered.filter(e => {
        const evDate = new Date(e.date);
        if (dateFilter === 'today') return evDate.toDateString() === today.toDateString();
        if (dateFilter === 'week') return evDate >= today && evDate <= nextWeek;
        if (dateFilter === 'month') return evDate >= today && evDate <= nextMonth;
        return true;
      });
    }

    if (selectedCats.length > 0) {
      filtered = filtered.filter(e => selectedCats.includes(e.category));
    }

    if (priceFilter !== 'all') {
      filtered = filtered.filter(e => {
        const isFree = e.price === 'Free' || e.price === 0 || e.price === 'Free Entry';
        if (priceFilter === 'free') return isFree;
        if (priceFilter === 'paid') return !isFree;
        return true;
      });
    }

    if (venueFilter) {
      filtered = filtered.filter(e => e.venue === venueFilter);
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.registered - a.registered);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setEvents(filtered);
    setTimeout(() => setLoading(false), 300); // Small delay for UX
  }, [search, dateFilter, selectedCats, priceFilter, venueFilter, sortBy, allEvents]);

  const clearFilters = () => {
    setSearch('');
    setDateFilter('all');
    setSelectedCats([]);
    setPriceFilter('all');
    setVenueFilter('');
  };

  const toggleCategory = (cat) => {
    setSelectedCats(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link> <span>›</span> <span>Events</span></div>
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
              {['Academic', 'Technical', 'Cultural', 'Sports', 'Entertainment', 'Career', 'Social', 'Competition'].map(cat => (
                <label key={cat} className="filter-option">
                  <input type="checkbox" value={cat} checked={selectedCats.includes(cat)} onChange={() => toggleCategory(cat)} /> {cat}
                </label>
              ))}
            </div>

            <div className="filter-card">
              <h3><IndianRupee className="inline w-5 h-5 text-primary-500 mb-1" /> Price</h3>
              <label className="filter-option"><input type="radio" name="priceFilter" value="all" checked={priceFilter === 'all'} onChange={() => setPriceFilter('all')} /> All</label>
              <label className="filter-option"><input type="radio" name="priceFilter" value="free" checked={priceFilter === 'free'} onChange={() => setPriceFilter('free')} /> Free Only</label>
              <label className="filter-option"><input type="radio" name="priceFilter" value="paid" checked={priceFilter === 'paid'} onChange={() => setPriceFilter('paid')} /> Paid Only</label>
            </div>
            
            <div className="filter-card">
              <h3><MapPin className="inline w-5 h-5 text-primary-500 mb-1" /> Venue</h3>
              <div className="form-group" style={{ margin: 0 }}>
                <select value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)}>
                  <option value="">All Venues</option>
                  {cuVenues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={clearFilters}>Clear All Filters</button>
          </aside>

          {/* MAIN */}
          <main>
            <div className="events-toolbar">
              <span className="events-count">Showing {events.length} events</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: "'Inter', sans-serif" }}
                >
                  <option value="date">Date (Nearest)</option>
                  <option value="popular">Popularity</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="events-grid">
                {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: '300px', background: 'var(--border-light)', borderRadius: '12px' }}></div>)}
              </div>
            ) : events.length === 0 ? (
              <div id="emptyState" className="empty-state">
                <div className="empty-icon"><Search style={{ width: '48px', height: '48px' }} /></div>
                <h3>No events found</h3>
                <p>Try adjusting your filters or check back later</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="events-grid">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
