import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">CU Events</h3>
            <p className="text-sm">The official event management portal for university students and organisers.</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/events" className="hover:text-white transition-colors">Browse Events</a></li>
              <li><a href="/clubs" className="hover:text-white transition-colors">Student Clubs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Support</h3>
            <p className="text-sm">Email: support@cuevents.edu<br/>Phone: +91 12345 67890</p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} CU Events Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
