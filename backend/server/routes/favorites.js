const express = require('express');
const supabase = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/favorites/:eventId — Toggle
router.post('/:eventId', authMiddleware, async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const { data: event } = await supabase.from('events').select('id, title').eq('id', eventId).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });

        const { data: existing } = await supabase.from('favorites').select('user_id').eq('user_id', req.userId).eq('event_id', eventId).maybeSingle();
        if (existing) {
            await supabase.from('favorites').delete().eq('user_id', req.userId).eq('event_id', eventId);
            res.json({ isFavorite: false, message: 'Removed from favorites' });
        } else {
            await supabase.from('favorites').insert({ user_id: req.userId, event_id: eventId });
            res.json({ isFavorite: true, message: 'Added to favorites' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/favorites
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data: favs, error } = await supabase.from('favorites').select('event_id, events(*)').eq('user_id', req.userId).order('created_at', { ascending: false });
        if (error) throw error;
        const favorites = (favs || []).map(f => f.events).filter(Boolean);
        res.json({ favorites });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
