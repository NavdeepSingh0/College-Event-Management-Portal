import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function EventCard({ event }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.poster_url || '/placeholder.jpg'} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-slate-800">
          {event.category}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary-600">
          {event.price > 0 ? `₹${event.price}` : 'Free'}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{event.title}</h3>
        
        <div className="space-y-2 mb-4 text-sm text-slate-600 flex-grow">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{event.registered_count || 0} / {event.capacity} registered</span>
          </div>
        </div>
        
        <Link 
          to={`/events/${event.id}`} 
          className="block w-full text-center bg-slate-50 hover:bg-primary-50 text-primary-600 font-medium py-2 rounded-lg transition-colors border border-primary-100 mt-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
