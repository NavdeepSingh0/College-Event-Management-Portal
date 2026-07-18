import React, { useState, useEffect } from 'react';
import { Search, Calendar, Folder, IndianRupee, MapPin } from 'lucide-react';
import EventCard from '../components/EventCard';
import { api } from '../api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState([]);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setEvents([
        { id: 1, title: 'Annual Tech Symposium', category: 'Technical & IT', price: 0, date: '2026-08-15', time: '10:00', venue: 'Main Auditorium', capacity: 500, registered_count: 230 },
        { id: 2, title: 'Cultural Fest 2026', category: 'Cultural & Arts', price: 200, date: '2026-09-01', time: '17:00', venue: 'Open Air Theatre', capacity: 1000, registered_count: 450 },
        { id: 3, title: 'Startup Pitch Deck', category: 'Entrepreneurship', price: 50, date: '2026-08-20', time: '14:00', venue: 'Block C Seminar Hall', capacity: 100, registered_count: 85 }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Events</h1>
          <p className="text-slate-600">Discover and register for upcoming university events.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-primary-500" /> Search
              </h3>
              <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Folder className="w-5 h-5 text-primary-500" /> Category
              </h3>
              <div className="space-y-2">
                {['Technical & IT', 'Cultural & Arts', 'Entrepreneurship', 'Sports & Fitness'].map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-slate-700 text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Event Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-slate-200 rounded-xl"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
