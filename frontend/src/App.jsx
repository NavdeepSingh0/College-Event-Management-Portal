import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import StudentDashboard from './pages/StudentDashboard';
import OrganiserDashboard from './pages/OrganiserDashboard';
import CalendarView from './pages/CalendarView';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Handle scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: stop observing once revealed
          // observer.unobserve(entry.target); 
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // A simple way to handle dynamically rendered elements in React
    // is to just observe all elements on route change or after a short delay
    const observeElements = () => {
      document.querySelectorAll('.fade-in:not(.visible), .slide-up:not(.visible)').forEach((el) => {
        observer.observe(el);
      });
    };

    observeElements();
    
    // Also set up a MutationObserver to catch elements rendered asynchronously (like events data loading)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });
    
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onOpenAuth={openAuth} toggleTheme={toggleTheme} theme={theme} />
      
      <main style={{ flex: 1, marginTop: '65px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/organiser-dashboard" element={<OrganiserDashboard />} />
          <Route path="/calendar" element={<CalendarView />} />
        </Routes>
      </main>

      <Footer />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
      />
    </div>
  );
}

export default App;
