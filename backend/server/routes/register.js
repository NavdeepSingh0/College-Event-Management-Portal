const express = require('express');
const supabase = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/email');

const router = express.Router();

// POST /api/register/send-otp
router.post('/send-otp', authMiddleware, async (req, res) => {
    try {
        const { eventId, email } = req.body;
        if (!eventId) return res.status(400).json({ error: 'Event ID is required' });
        if (!email || !email.includes('@')) return res.status(400).json({ error: 'A valid email address is required' });

        const { data: event } = await supabase.from('events').select('id, title, capacity, registered_count, visibility, allow_external').eq('id', eventId).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.registered_count >= event.capacity) return res.status(400).json({ error: 'This event is fully booked' });

        if (event.visibility === 'cu_only' || event.allow_external === 0) {
            const { data: user } = await supabase.from('users').select('cu_id, email, college').eq('id', req.userId).single();
            const isCU = user && (user.cu_id || user.email?.endsWith('@cuchd.in') || user.college === 'Chandigarh University');
            if (!isCU) return res.status(403).json({ error: 'This event is restricted to CU students only' });
        }

        const { data: existing } = await supabase.from('registrations').select('id').eq('user_id', req.userId).eq('event_id', eventId).maybeSingle();
        if (existing) return res.status(400).json({ error: 'You are already registered for this event' });

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await supabase.from('otps').delete().eq('email', email.toLowerCase()).eq('event_id', eventId);
        await supabase.from('otps').insert({ email: email.toLowerCase(), otp, event_id: eventId, user_id: req.userId, expires_at: expiresAt });

        let devOtp = null;
        try { await sendOtpEmail(email, otp, event.title); } catch (emailErr) {
            console.warn('⚠️ Email send failed, OTP:', otp);
            devOtp = otp;
        }
        res.json({ message: `Verification code sent to ${email}`, devOtp });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/register/verify-otp
router.post('/verify-otp', authMiddleware, async (req, res) => {
    try {
        const { eventId, otp, participantName, participantCollege, participantPhone } = req.body;
        if (!eventId || !otp) return res.status(400).json({ error: 'Event ID and OTP are required' });

        const now = new Date().toISOString();
        const { data: otpRecord } = await supabase.from('otps').select('*').eq('event_id', eventId).eq('user_id', req.userId).eq('otp', otp).gt('expires_at', now).order('id', { ascending: false }).limit(1).maybeSingle();
        if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP. Please try again.' });

        const { data: user } = await supabase.from('users').select('cu_id, email, name, college').eq('id', req.userId).single();

        const { error: regError } = await supabase.from('registrations').insert({
            user_id: req.userId, event_id: eventId,
            uid: user?.cu_id || user?.email?.split('@')[0] || 'ext',
            email: otpRecord.email, status: 'confirmed',
            participant_name: participantName || user?.name || null,
            participant_college: participantCollege || user?.college || null,
            participant_phone: participantPhone || null
        });
        if (regError) {
            if (regError.code === '23505') return res.status(400).json({ error: 'Already registered for this event' });
            throw regError;
        }

        await supabase.rpc('increment_registered_count', { p_event_id: eventId });
        await supabase.from('otps').delete().eq('id', otpRecord.id);

        const { data: event } = await supabase.from('events').select('title').eq('id', eventId).single();
        await supabase.from('notifications').insert({ user_id: req.userId, message: `✅ Successfully registered for "${event?.title || 'Event'}"!`, type: 'success' });

        res.json({ message: 'Registration confirmed!' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/registrations
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data: regs, error } = await supabase.from('registrations').select('*, events(title, category, date, start_time, end_time, venue, price, capacity, registered_count, organizer)').eq('user_id', req.userId).order('registered_at', { ascending: false });
        if (error) throw error;

        const registrations = (regs || []).map(r => ({
            ...r,
            title: r.events?.title, category: r.events?.category, date: r.events?.date,
            start_time: r.events?.start_time, end_time: r.events?.end_time,
            venue: r.events?.venue, price: r.events?.price,
            capacity: r.events?.capacity, registered_count: r.events?.registered_count,
            organizer: r.events?.organizer, events: undefined
        }));
        res.json({ registrations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/registrations/:eventId
router.delete('/:eventId', authMiddleware, async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const { data, error } = await supabase.from('registrations').delete().eq('user_id', req.userId).eq('event_id', eventId).select();
        if (data && data.length > 0) {
            await supabase.rpc('decrement_registered_count', { p_event_id: eventId });
        }
        res.json({ message: 'Registration cancelled' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
