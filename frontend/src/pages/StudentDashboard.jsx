import React, { useState, useEffect } from 'react';
import { Calendar, Bell, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Mock fetch
    setRegisteredEvents([
      { id: 1, title: 'Annual Tech Symposium', category: 'Technical & IT', price: 0, date: '2026-08-15', time: '10:00', venue: 'Main Auditorium', capacity: 500, registered_count: 230 }
    ]);
    setAnnouncements([
      { id: 1, title: 'Venue Changed for Tech Symposium', message: 'The event has been moved to the Main Auditorium.', date: '2026-08-10' }
    ]);
  }, []);

  if (!user) return <div className="p-20 text-center">Please login to view your dashboard.</div>;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Student Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" /> My Registered Events
              </h2>
              {registeredEvents.length === 0 ? (
                <p className="text-slate-500">You haven't registered for any events yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registeredEvents.map(event => (
                    <div key={event.id} className="relative">
                      <EventCard event={event} />
                      <button className="absolute top-4 right-4 bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors" title="Cancel Registration">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> Announcements
              </h2>
              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-1">{ann.title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{ann.message}</p>
                    <span className="text-xs text-slate-400">{ann.date}</span>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-slate-500">No new announcements.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
