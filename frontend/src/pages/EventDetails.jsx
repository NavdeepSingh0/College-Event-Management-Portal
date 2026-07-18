import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
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
        category: 'Technical & IT',
        price: 0,
        date: '2026-08-15',
        time: '10:00',
        venue: 'Main Auditorium',
        capacity: 500,
        registered_count: 230,
        poster_url: '/placeholder.jpg',
        organizer: 'CU Tech Society'
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Loading event details...</div>;
  if (!event) return <div className="p-20 text-center text-red-500">Event not found</div>;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-64 sm:h-96 w-full relative">
            <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-primary-600">
              {event.price > 0 ? `₹${event.price}` : 'Free'}
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-sm font-medium rounded-full mb-3">
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
                <p className="text-slate-500 mt-2">Organized by {event.organizer}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 py-6 border-y border-slate-100">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="bg-slate-50 p-3 rounded-lg"><Calendar className="w-6 h-6 text-primary-500" /></div>
                <div>
                  <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="bg-slate-50 p-3 rounded-lg"><MapPin className="w-6 h-6 text-primary-500" /></div>
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-sm text-slate-500">{event.venue}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="bg-slate-50 p-3 rounded-lg"><Users className="w-6 h-6 text-primary-500" /></div>
                <div>
                  <p className="font-medium">Availability</p>
                  <p className="text-sm text-slate-500">{event.capacity - event.registered_count} seats left</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">About the Event</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            <div className="flex justify-center pt-6">
              {user ? (
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all w-full sm:w-auto justify-center text-lg">
                  <Ticket className="w-5 h-5" /> Register Now
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-slate-500 mb-3">Please login to register for this event.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
