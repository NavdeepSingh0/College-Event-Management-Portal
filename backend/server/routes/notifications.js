const express = require('express');
const supabase = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data: notifications, error } = await supabase.from('notifications').select('*').eq('user_id', req.userId).order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        const unreadCount = (notifications || []).filter(n => n.read === 0).length;
        res.json({ notifications: notifications || [], unreadCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/notifications/read-all
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        await supabase.from('notifications').update({ read: 1 }).eq('user_id', req.userId);
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/notifications/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await supabase.from('notifications').delete().eq('id', req.params.id).eq('user_id', req.userId);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
