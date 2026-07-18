import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut } from 'lucide-react';

export default function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              CU
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Events</span>
          </Link>

          <div className="hidden md:flex gap-6 items-center">
            <Link to="/events" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Events</Link>
            <Link to="/calendar" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Calendar</Link>
            <Link to="/clubs" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Clubs</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to={user.role === 'organiser' ? '/organiser-dashboard' : '/dashboard'} className="text-slate-600 hover:text-primary-600">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={logout} className="text-slate-600 hover:text-red-500">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={onOpenAuth} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
