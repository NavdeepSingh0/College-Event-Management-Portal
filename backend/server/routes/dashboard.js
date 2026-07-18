const express = require('express');
const supabase = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const { count: registrations } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('user_id', req.userId);
        const { count: favorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', req.userId);
        const { count: created } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('created_by', req.userId);
        const { count: unread } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', req.userId).eq('read', 0);

        const today = new Date().toISOString().split('T')[0];
        const { data: regRows } = await supabase.from('registrations').select('event_id').eq('user_id', req.userId);
        const eventIds = (regRows || []).map(r => r.event_id);

        let upcoming = [];
        if (eventIds.length > 0) {
            const { data } = await supabase.from('events').select('*').in('id', eventIds).gte('date', today).order('date').limit(5);
            upcoming = data || [];
        }

        res.json({
            stats: { registrations: registrations || 0, favorites: favorites || 0, created: created || 0, unread: unread || 0 },
            upcoming
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
