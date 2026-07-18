import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ClipboardList } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  
  // Modes: 'login', 'signup-role', 'signup-step1', 'signup-step2'
  const [mode, setMode] = useState(initialMode);
  
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === 'signup' ? 'signup-role' : 'login');
    }
  }, [isOpen, initialMode]);

  const [role, setRole] = useState('attendee'); // 'attendee', 'organiser'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Extended signup fields
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('Chandigarh University');
  const [department, setDepartment] = useState('');
  
  // Attendee specific
  const [year, setYear] = useState('');
  const [cuId, setCuId] = useState('');
  
  // Organiser specific
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('university_club');
  
  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      alert(err.error || err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSignupStep1 = (e) => {
    e.preventDefault();
    setMode('signup-step2');
  };

  const handleSignupComplete = async (e) => {
    e.preventDefault();
    try {
      await register({ 
        email, 
        password, 
        name, 
        role, 
        phone,
        college,
        department,
        year: role === 'attendee' ? year : null,
        cuId: role === 'attendee' ? cuId : null,
        organizationName: role === 'organiser' ? orgName : null,
        organizationType: role === 'organiser' ? orgType : null
      });
      onClose();
    } catch (err) {
      alert(err.error || err.message || 'Signup failed. Please try again.');
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
              <button type="submit" className="btn-auth-submit">Login →</button>
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
              <div className="role-card" style={{ border: '2px solid var(--border)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: '0.2s' }} onClick={() => { setRole('attendee'); setMode('signup-step1'); }}>
                <div style={{ marginBottom: '0.5rem' }}><GraduationCap className="w-8 h-8 text-primary" /></div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Student / Attendee</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>I want to explore and register for campus events.</p>
              </div>
              <div className="role-card" style={{ border: '2px solid var(--border)', borderRadius: '12px', padding: '1.5rem', cursor: 'pointer', transition: '0.2s' }} onClick={() => { setRole('organiser'); setMode('signup-step1'); }}>
                <div style={{ marginBottom: '0.5rem' }}><ClipboardList className="w-8 h-8 text-primary" /></div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Event Organiser</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>I represent a club or department and want to host events.</p>
              </div>
            </div>
            <div className="auth-switch" style={{ marginTop: '2rem' }}>
              Already have an account? <span onClick={() => setMode('login')}>Login</span>
            </div>
          </div>
        )}

        {/* SIGNUP STEP 1: BASICS */}
        {mode === 'signup-step1' && (
          <div className="auth-form active">
            <div className="auth-header">
              <h2>Create Account (1/2)</h2>
              <p>Registering as {role === 'organiser' ? 'an Organiser' : 'a Student'}</p>
            </div>
            <form onSubmit={handleSignupStep1}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" placeholder="Your full name" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" placeholder="youremail@cuchd.in" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" placeholder="Create a secure password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn-auth-submit">Continue →</button>
            </form>
            <div className="auth-switch" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <span onClick={() => setMode('signup-role')}>← Back to roles</span>
            </div>
          </div>
        )}

        {/* SIGNUP STEP 2: DETAILS */}
        {mode === 'signup-step2' && (
          <div className="auth-form active">
            <div className="auth-header">
              <h2>Complete Profile (2/2)</h2>
              <p>Just a few more details to set up your account</p>
            </div>
            <form onSubmit={handleSignupComplete}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" placeholder="+91" required value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>College/University *</label>
                  <input type="text" required value={college} onChange={e => setCollege(e.target.value)} />
                </div>
              </div>
              
              <div className="form-group">
                <label>Department *</label>
                <input type="text" placeholder="e.g. CSE, Business, Arts" required value={department} onChange={e => setDepartment(e.target.value)} />
              </div>

              {role === 'attendee' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>CU ID / Roll No</label>
                    <input type="text" placeholder="e.g. 21BCS1234" value={cuId} onChange={e => setCuId(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Year of Study</label>
                    <select value={year} onChange={e => setYear(e.target.value)}>
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                  </div>
                </div>
              )}

              {role === 'organiser' && (
                <>
                  <div className="form-group">
                    <label>Club / Organization Name *</label>
                    <input type="text" placeholder="e.g. Tech Society" required value={orgName} onChange={e => setOrgName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Organization Type *</label>
                    <select required value={orgType} onChange={e => setOrgType(e.target.value)}>
                      <option value="university_club">University Club / Society</option>
                      <option value="department">Academic Department</option>
                      <option value="external">External Organization</option>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="btn-auth-submit">Create Account</button>
            </form>
            <div className="auth-switch" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <span onClick={() => setMode('signup-step1')}>← Back to basic details</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
