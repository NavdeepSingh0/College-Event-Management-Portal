import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OrganiserDashboard() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    // Mock fetch
    setMyEvents([
      { id: 1, title: 'Annual Tech Symposium', date: '2026-08-15', registered_count: 230, capacity: 500, views: 1200 },
      { id: 2, title: 'Hackathon 2026', date: '2026-09-10', registered_count: 150, capacity: 200, views: 800 }
    ]);
  }, []);

  if (!user || user.role !== 'organiser') {
    return <div className="p-20 text-center text-red-500">Access Denied. Organiser role required.</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Organiser Dashboard</h1>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" /> Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Events</h3>
            <p className="text-3xl font-bold text-slate-900">{myEvents.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Registrations</h3>
            <p className="text-3xl font-bold text-slate-900">
              {myEvents.reduce((acc, ev) => acc + ev.registered_count, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Views</h3>
            <p className="text-3xl font-bold text-slate-900">
              {myEvents.reduce((acc, ev) => acc + ev.views, 0)}
            </p>
          </div>
        </div>

        {/* Event List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Manage Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-medium">
                <tr>
                  <th className="px-6 py-3">Event Name</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Registrations</th>
                  <th className="px-6 py-3">Views</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{event.title}</td>
                    <td className="px-6 py-4">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-primary-500" />
                        {event.registered_count} / {event.capacity}
                      </div>
                    </td>
                    <td className="px-6 py-4">{event.views}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary-600 hover:text-primary-800 p-2" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 p-2 ml-2" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {myEvents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      You haven't created any events yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
