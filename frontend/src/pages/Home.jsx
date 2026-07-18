import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Target } from 'lucide-react';
import EventCard from '../components/EventCard';
import { api } from '../api';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch for now until backend is fully hooked up
    // api.events.getFeatured().then(data => setFeaturedEvents(data)).catch(console.error);
    setTimeout(() => {
      setFeaturedEvents([
        { id: 1, title: 'Annual Tech Symposium', category: 'Technical & IT', price: 0, date: '2026-08-15', time: '10:00', venue: 'Main Auditorium', capacity: 500, registered_count: 230 },
        { id: 2, title: 'Cultural Fest 2026', category: 'Cultural & Arts', price: 200, date: '2026-09-01', time: '17:00', venue: 'Open Air Theatre', capacity: 1000, registered_count: 450 },
        { id: 3, title: 'Startup Pitch Deck', category: 'Entrepreneurship', price: 50, date: '2026-08-20', time: '14:00', venue: 'Block C Seminar Hall', capacity: 100, registered_count: 85 }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover Campus Events</h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Your one-stop platform for all university events, fests, and club activities. 
            Register, participate, and make memories.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/events" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
              Explore Events <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Events</h2>
              <p className="text-slate-600">Don't miss out on these upcoming major events.</p>
            </div>
            <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-96 bg-slate-200 rounded-xl"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
