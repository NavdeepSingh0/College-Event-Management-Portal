import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login for now
    login('mock-token-123', 'student');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isLogin ? 'Enter your details to access your account' : 'Sign up to register for events'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            
            <button type="submit" className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors mt-6">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary-600 font-medium hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
