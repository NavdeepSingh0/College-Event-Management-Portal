import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const events = {
    15: { title: 'Annual Tech Symposium', type: 'tech' },
    20: { title: 'Startup Pitch Deck', type: 'business' }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Event Calendar</h1>
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft /></button>
              <h2 className="text-xl font-medium">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 py-3 text-center text-sm font-bold text-slate-600">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[120px] p-2" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const event = events[day];
              return (
                <div key={day} className="bg-white min-h-[120px] p-2 border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm ${event ? 'bg-primary-100 text-primary-700 font-bold' : 'text-slate-500'}`}>
                    {day}
                  </span>
                  {event && (
                    <div className="mt-2 p-2 text-xs bg-primary-50 text-primary-700 rounded border border-primary-100 font-medium truncate">
                      {event.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
