const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cu-events-secret-key-2026';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone, department, year, cuId, role, organizationName, organizationType, college } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
        if (!email.includes('@')) return res.status(400).json({ error: 'Please enter a valid email address' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const userRole = (role === 'organiser') ? 'organiser' : 'attendee';

        // Check existing email
        const { data: existingEmail } = await supabase.from('users').select('id').eq('email', email.toLowerCase().trim()).single();
        if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

        // Check existing CU ID
        if (cuId && cuId.trim()) {
            const { data: existingCuId } = await supabase.from('users').select('id').eq('cu_id', cuId.trim()).single();
            if (existingCuId) return res.status(409).json({ error: 'CU ID already registered' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { data: newUser, error } = await supabase.from('users').insert({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password_hash,
            phone: phone || null,
            department: department || null,
            year: year || null,
            cu_id: (cuId && cuId.trim()) ? cuId.trim() : null,
            role: userRole,
            organization_name: (userRole === 'organiser' && organizationName) ? organizationName.trim() : null,
            organization_type: (userRole === 'organiser' && organizationType) ? organizationType : null,
            college: college || 'Chandigarh University'
        }).select().single();

        if (error) throw error;

        const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

        // Welcome notification
        const welcomeMsg = userRole === 'organiser'
            ? 'Welcome to CU Events Organiser Panel! Create your first event.'
            : 'Welcome to CU Events! Start exploring and registering for events.';
        await supabase.from('notifications').insert({ user_id: newUser.id, message: welcomeMsg, type: 'success' });

        const { password_hash: _, ...safeUser } = newUser;
        res.status(201).json({ user: safeUser, token });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.code === '23505') return res.status(409).json({ error: 'Email or CU ID already registered' });
        res.status(500).json({ error: err.message || 'Signup failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { identifier, password, cuId } = req.body;
        const loginId = (identifier || cuId || '').trim();
        if (!loginId || !password) return res.status(400).json({ error: 'Email/CU ID and password are required' });

        let { data: user } = await supabase.from('users').select('*').eq('email', loginId.toLowerCase()).single();
        if (!user) {
            const resp = await supabase.from('users').select('*').eq('cu_id', loginId).single();
            user = resp.data;
        }
        if (!user) return res.status(401).json({ error: 'No account found with this email/CU ID' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user.id, role: user.role || 'attendee' }, JWT_SECRET, { expiresIn: '7d' });
        const { password_hash: _, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message || 'Login failed' });
    }
});

// POST /api/auth/demo-login
router.post('/demo-login', async (req, res) => {
    try {
        const { role } = req.body;
        const demoEmail = (role === 'organiser') ? 'rahul.organiser@gmail.com' : 'priya@cuchd.in';
        const { data: user, error } = await supabase.from('users').select('*').eq('email', demoEmail).single();
        if (error || !user) return res.status(500).json({ error: 'Demo user not found. Run schema.sql in Supabase.' });

        const token = jwt.sign({ userId: user.id, role: user.role || 'attendee' }, JWT_SECRET, { expiresIn: '7d' });
        const { password_hash: _, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('id', req.userId).single();
        if (error || !user) return res.status(404).json({ error: 'User not found' });
        const { password_hash: _, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, phone, department, year, organizationName, organizationType, college, bio } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (department !== undefined) updates.department = department;
        if (year !== undefined) updates.year = year;
        if (college !== undefined) updates.college = college;
        if (bio !== undefined) updates.bio = bio;
        if (organizationName !== undefined) updates.organization_name = organizationName;
        if (organizationType !== undefined) updates.organization_type = organizationType;

        if (Object.keys(updates).length === 0) {
            const { data: user } = await supabase.from('users').select('*').eq('id', req.userId).single();
            const { password_hash: _, ...safeUser } = user;
            return res.json({ user: safeUser });
        }

        const { data: user, error } = await supabase.from('users').update(updates).eq('id', req.userId).select().single();
        if (error) throw error;
        const { password_hash: _, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both fields required' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

        const { data: user } = await supabase.from('users').select('password_hash').eq('id', req.userId).single();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

        const hash = await bcrypt.hash(newPassword, 10);
        await supabase.from('users').update({ password_hash: hash }).eq('id', req.userId);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
