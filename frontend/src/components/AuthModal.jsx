import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login', 'signup-role', 'signup'
  const [role, setRole] = useState('attendee'); // 'attendee', 'organiser'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  
  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await register({ email, password, name, role, organizationName: orgName });
      onClose();
    } catch (err) {
      alert(err.message || 'Signup failed');
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal">
        <button className="close-modal" onClick={onClose}>&times;</button>
        
        {/* LOGIN FORM */}
        {mode === 'login' && (
          <div className="auth-form active">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Login to your CU Events account</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email or CU ID</label>
                <input type="text" placeholder="e.g. 21BCS1234 or email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Login →</button>
            </form>
            <div className="auth-switch">
              Don't have an account? <span onClick={() => setMode('signup-role')}>Sign up</span>
            </div>
          </div>
        )}

        {/* ROLE SELECTION */}
        {mode === 'signup-role' && (
          <div className="auth-form active">
            <div className="auth-header">
              <h2>Join CU Events</h2>
              <p>How do you want to use the platform?</p>
            </div>
            <div className="role-options" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
              <div className="role-card" style={{ border: '2px solid var(--border)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: '0.2s' }} onClick={() => { setRole('attendee'); setMode('signup'); }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Student / Attendee</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>I want to explore and register for campus events.</p>
              </div>
              <div className="role-card" style={{ border: '2px solid var(--border)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: '0.2s' }} onClick={() => { setRole('organiser'); setMode('signup'); }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Event Organiser</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>I represent a club or department and want to host events.</p>
              </div>
            </div>
            <div className="auth-switch" style={{ marginTop: '2rem' }}>
              Already have an account? <span onClick={() => setMode('login')}>Login</span>
            </div>
          </div>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <div className="auth-form active">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Registering as {role === 'organiser' ? 'an Organiser' : 'a Student'}</p>
            </div>
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" placeholder="Your name" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" placeholder="youremail@gmail.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              {role === 'organiser' && (
                <div className="form-group">
                  <label>Club / Organization Name *</label>
                  <input type="text" placeholder="e.g. CU Tech Society" required value={orgName} onChange={e => setOrgName(e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label>Password *</label>
                <input type="password" placeholder="Create a secure password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Create Account</button>
            </form>
            <div className="auth-switch" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <span onClick={() => setMode('signup-role')}>← Back to roles</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
