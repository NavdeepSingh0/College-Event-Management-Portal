import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showRegModal, setShowRegModal] = useState(false);
  const [regEmail, setRegEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [regMsg, setRegMsg] = useState({ text: '', type: '' });
  const [devOtp, setDevOtp] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        if (res.event) {
          setEvent(res.event);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (user && !regEmail) setRegEmail(user.email);
  }, [user]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setRegMsg({ text: 'Sending...', type: 'info' });
    try {
      const res = await API.post('/register/send-otp', { eventId: id, email: regEmail });
      setRegMsg({ text: res.message || 'OTP Sent', type: 'success' });
      if (res.devOtp) setDevOtp(res.devOtp);
      setStep(2);
    } catch (err) {
      setRegMsg({ text: err.error || err.message || 'Failed to send OTP', type: 'error' });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setRegMsg({ text: 'Verifying...', type: 'info' });
    try {
      await API.post('/register/verify-otp', { eventId: id, otp, email: regEmail });
      setRegMsg({ text: 'Registration confirmed!', type: 'success' });
      setStep(3); // success step
      // update count
      setEvent(prev => ({ ...prev, registered_count: prev.registered_count + 1 }));
    } catch (err) {
      setRegMsg({ text: err.error || err.message || 'Invalid OTP', type: 'error' });
    }
  };

  if (loading) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Loading...</div>;
  if (!event) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Event not found</div>;

  const fallbackImg = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000';
  const bgImg = event.poster_url || fallbackImg;

  return (
    <>
      <div className="page-header" style={{ padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> <span>›</span> <Link to="/events">Events</Link> <span>›</span> <span>{event.title}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '400px', width: '100%', background: `url('${bgImg}') center/cover no-repeat` }}></div>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <span className="category-badge" style={{ position: 'relative', top: 0, left: 0, backgroundColor: 'var(--cat-technical)' }}>{event.category}</span>
              </div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{event.title}</h1>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>About the Event</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{event.description}</p>
              </div>
            </div>
          </div>

          <div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Event Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{new Date(event.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.time}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar className="w-5 h-5 text-red-500" style={{ color: '#DC2626' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#DC2626' }}>Registration Closes</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {(() => {
                        let d = new Date(event.date);
                        d.setDate(d.getDate() - 2);
                        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
                      })()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Venue</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.venue}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Availability</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.capacity - event.registered_count} seats left</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Price</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: event.price === 0 ? 'var(--green)' : 'var(--text)' }}>
                  {event.price === 0 ? 'Free' : `₹${event.price}`}
                </span>
              </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowRegModal(true)}>
                <Ticket className="w-5 h-5" /> Register Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRegModal && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: '400px', position: 'relative' }}>
            <button className="close-modal" onClick={() => setShowRegModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', padding: '0' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F3F4F6'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>&times;</button>
            <div className="auth-header">
              <h2>Register for Event</h2>
              <p>{event.title}</p>
            </div>

            {regMsg.text && (
              <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: regMsg.type === 'error' ? '#FEE2E2' : regMsg.type === 'success' ? '#DCFCE7' : '#E0F2FE', color: regMsg.type === 'error' ? '#DC2626' : regMsg.type === 'success' ? '#16A34A' : '#0284C7' }}>
                {regMsg.text}
              </div>
            )}
            
            {devOtp && step === 2 && (
              <div style={{ padding: '0.8rem', background: '#F3F4F6', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                Testing OTP: {devOtp}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Confirm Email</label>
                  <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn-auth-submit">Send Verification Code</button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input type="text" placeholder="123456" required value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem', fontWeight: 700, borderColor: regMsg.type === 'error' ? '#DC2626' : 'var(--border)' }} />
                </div>
                <button type="submit" className="btn-auth-submit">Verify & Register</button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer' }}>Didn't receive the code? Resend</button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>You have successfully registered for {event.title}.</p>
                <button className="btn btn-secondary" onClick={() => setShowRegModal(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
