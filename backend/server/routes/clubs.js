const express = require('express');
const supabase = require('../db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/email');

const router = express.Router();

// Static clubs data
const clubs = [
    { id: 1, name: 'CU Coding Club', category: 'Technical & IT', logo: 'laptop', description: 'Promoting coding culture and competitive programming at CU.', members: 856, events: 8, founded: 2015, email: 'coding@cuclubs.in' },
    { id: 2, name: 'CU Cultural Society', category: 'Cultural & Arts', logo: 'masks', description: 'Celebrating diverse cultures through music, dance, and drama.', members: 1234, events: 12, founded: 2012, email: 'cultural@cuclubs.in' },
    { id: 3, name: 'Robotics Club CU', category: 'Technical & IT', logo: 'bot', description: 'Building the future with robots, automation, and AI.', members: 423, events: 5, founded: 2016, email: 'robotics@cuclubs.in' },
    { id: 4, name: 'CU Photography Club', category: 'Creative Arts', logo: 'camera', description: 'Capturing moments and telling stories through the lens.', members: 567, events: 6, founded: 2014, email: 'photography@cuclubs.in' },
    { id: 5, name: 'E-Cell CU', category: 'Business & Innovation', logo: 'rocket', description: 'Fostering entrepreneurship and startup culture on campus.', members: 678, events: 10, founded: 2013, email: 'ecell@cuclubs.in' },
    { id: 6, name: 'CU Music Society', category: 'Cultural & Arts', logo: 'music', description: 'Harmonizing voices and instruments across campus.', members: 345, events: 7, founded: 2015, email: 'music@cuclubs.in' },
    { id: 7, name: 'CU Debate Society', category: 'Academic', logo: '🗣️', description: 'Sharpening minds through debates, MUNs, and discussions.', members: 289, events: 8, founded: 2014, email: 'debate@cuclubs.in' },
    { id: 8, name: 'NSS Unit CU', category: 'Social Service', logo: 'handshake', description: 'Serving communities through impactful social initiatives.', members: 912, events: 15, founded: 2010, email: 'nss@cuclubs.in' },
    { id: 9, name: 'CU Sports Committee', category: 'Sports & Fitness', logo: '🏆', description: 'Organizing competitions and promoting sports excellence.', members: 756, events: 20, founded: 2011, email: 'sports@cuclubs.in' },
    { id: 10, name: 'InfoSec Club', category: 'Technical & IT', logo: 'shield', description: 'Exploring cybersecurity, ethical hacking, and digital forensics.', members: 234, events: 4, founded: 2018, email: 'infosec@cuclubs.in' }
];

// GET /api/clubs
router.get('/', optionalAuth, async (req, res) => {
    const { search, category } = req.query;
    let result = [...clubs];
    if (search) result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));
    if (category) result = result.filter(c => c.category === category);

    let myClubIds = [];
    if (req.userId) {
        const { data: rows } = await supabase.from('club_memberships').select('club_id').eq('user_id', req.userId);
        myClubIds = (rows || []).map(m => m.club_id);
    }
    result = result.map(c => ({ ...c, isMember: myClubIds.includes(c.id) }));
    res.json({ clubs: result, myClubIds });
});

// GET /api/clubs/my/memberships
router.get('/my/memberships', authMiddleware, async (req, res) => {
    try {
        const { data: rows, error } = await supabase.from('club_memberships').select('*').eq('user_id', req.userId);
        if (error) throw error;
        res.json({ memberships: rows || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/clubs/:id
router.get('/:id', (req, res) => {
    const club = clubs.find(c => c.id === parseInt(req.params.id));
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json({ club });
});

// POST /api/clubs/:id/join
router.post('/:id/join', authMiddleware, async (req, res) => {
    try {
        const clubId = parseInt(req.params.id);
        const club = clubs.find(c => c.id === clubId);
        if (!club) return res.status(404).json({ error: 'Club not found' });

        const { data: existing } = await supabase.from('club_memberships').select('id').eq('user_id', req.userId).eq('club_id', clubId).maybeSingle();
        if (existing) return res.status(400).json({ error: 'You are already a member of this club' });

        const { data: user } = await supabase.from('users').select('email, name').eq('id', req.userId).single();
        if (!user) return res.status(400).json({ error: 'User not found' });

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await supabase.from('otps').delete().eq('user_id', req.userId).is('event_id', null);
        await supabase.from('otps').insert({ email: user.email, otp, event_id: null, user_id: req.userId, expires_at: expiresAt });

        try { sendOtpEmail(user.email, otp).catch(() => {}); } catch (_) {}

        res.json({
            message: `OTP sent to ${user.email}`, email: user.email, clubName: club.name,
            devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
        });
    } catch (err) {
        console.error('Club join error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/clubs/:id/verify
router.post('/:id/verify', authMiddleware, async (req, res) => {
    try {
        const clubId = parseInt(req.params.id);
        const club = clubs.find(c => c.id === clubId);
        if (!club) return res.status(404).json({ error: 'Club not found' });

        const { otp } = req.body;
        if (!otp) return res.status(400).json({ error: 'OTP is required' });

        const { data: otpRecord } = await supabase.from('otps').select('*').eq('user_id', req.userId).is('event_id', null).eq('otp', otp).gt('expires_at', new Date().toISOString()).order('id', { ascending: false }).limit(1).maybeSingle();
        if (!otpRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });

        await supabase.from('otps').delete().eq('id', otpRecord.id);

        const { error: insertError } = await supabase.from('club_memberships').insert({ user_id: req.userId, club_id: clubId, club_name: club.name });
        if (insertError) {
            if (insertError.code === '23505') return res.status(400).json({ error: 'Already a member' });
            throw insertError;
        }

        await supabase.from('notifications').insert({ user_id: req.userId, message: `Welcome! You are now a member of ${club.name} party-popper`, type: 'success' });

        const { data: existingMembers } = await supabase.from('club_memberships').select('user_id').eq('club_id', clubId).neq('user_id', req.userId).limit(20);
        if (existingMembers && existingMembers.length > 0) {
            const { data: user } = await supabase.from('users').select('name').eq('id', req.userId).single();
            const notifications = existingMembers.map(m => ({
                user_id: m.user_id, message: `New member joined ${club.name}: ${user?.name || 'Someone'} 👋`, type: 'info'
            }));
            await supabase.from('notifications').insert(notifications);
        }

        res.json({ message: `Welcome to ${club.name}!`, clubName: club.name });
    } catch (err) {
        console.error('Club verify error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/clubs/:id/leave
router.delete('/:id/leave', authMiddleware, async (req, res) => {
    try {
        const clubId = parseInt(req.params.id);
        const club = clubs.find(c => c.id === clubId);
        await supabase.from('club_memberships').delete().eq('user_id', req.userId).eq('club_id', clubId);
        await supabase.from('notifications').insert({ user_id: req.userId, message: `You have left ${club ? club.name : 'the club'}`, type: 'info' });
        res.json({ message: 'Left the club' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
