const express = require('express');
const supabase = require('../db');
const { authMiddleware, organiserOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware, organiserOnly);

// GET /api/organiser/stats
router.get('/stats', async (req, res) => {
    try {
        const { data: events, error } = await supabase.from('events').select('*').eq('created_by', req.userId).order('created_at', { ascending: false });
        if (error) throw error;

        const totalEvents = (events || []).length;
        const totalRegistrations = (events || []).reduce((sum, e) => sum + (e.registered_count || 0), 0);
        const totalCapacity = (events || []).reduce((sum, e) => sum + (e.capacity || 0), 0);
        const avgFillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
        const today = new Date().toISOString().split('T')[0];
        const liveEvents = (events || []).filter(e => e.date >= today).length;
        const pastEvents = totalEvents - liveEvents;

        const categoryMap = {};
        (events || []).forEach(e => { categoryMap[e.category] = (categoryMap[e.category] || 0) + 1; });

        const eventIds = (events || []).map(e => e.id);
        let recentRegs = 0, totalViews = 0;
        if (eventIds.length > 0) {
            const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
            const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).in('event_id', eventIds).gte('registered_at', weekAgo);
            recentRegs = count || 0;

            const { data: analytics } = await supabase.from('event_analytics').select('views').in('event_id', eventIds);
            totalViews = (analytics || []).reduce((sum, a) => sum + (a.views || 0), 0);
        }

        res.json({
            stats: { totalEvents, totalRegistrations, totalCapacity, avgFillRate, liveEvents, pastEvents, recentRegs, totalViews },
            categoryBreakdown: categoryMap,
            events: events || []
        });
    } catch (err) {
        console.error('Organiser stats error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/organiser/events/:id/attendees
router.get('/events/:id/attendees', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { data: event } = await supabase.from('events').select('id, title, created_by').eq('id', eventId).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.created_by !== req.userId) return res.status(403).json({ error: 'You can only view attendees of your own events' });

        const { data: regs } = await supabase.from('registrations').select('*, users(name, email, phone, department, year, college, cu_id)').eq('event_id', eventId).order('registered_at', { ascending: false });

        const attendees = (regs || []).map(r => ({
            id: r.id,
            name: r.participant_name || r.users?.name || 'Unknown',
            email: r.email || r.users?.email || '',
            phone: r.participant_phone || r.users?.phone || '',
            college: r.participant_college || r.users?.college || '',
            department: r.users?.department || '',
            year: r.users?.year || '',
            cuId: r.uid || r.users?.cu_id || '',
            status: r.status || 'confirmed',
            registeredAt: r.registered_at,
            isExternal: !r.users?.cu_id && !(r.users?.email || '').endsWith('@cuchd.in')
        }));

        const totalAttendees = attendees.length;
        const cuStudents = attendees.filter(a => !a.isExternal).length;
        const external = totalAttendees - cuStudents;

        const deptMap = {}, collegeMap = {};
        attendees.forEach(a => { const d = a.department || 'Other'; deptMap[d] = (deptMap[d] || 0) + 1; });
        attendees.forEach(a => { const c = a.college || 'Unknown'; collegeMap[c] = (collegeMap[c] || 0) + 1; });

        res.json({
            event: { id: event.id, title: event.title },
            attendees,
            stats: { total: totalAttendees, cuStudents, external, departmentBreakdown: deptMap, collegeBreakdown: collegeMap }
        });
    } catch (err) {
        console.error('Attendees error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/organiser/events/:id/analytics
router.get('/events/:id/analytics', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.created_by !== req.userId) return res.status(403).json({ error: 'Access denied' });

        const { data: analytics } = await supabase.from('event_analytics').select('*').eq('event_id', eventId).maybeSingle();
        const { data: regs } = await supabase.from('registrations').select('registered_at').eq('event_id', eventId).order('registered_at');

        const timeline = {};
        (regs || []).forEach(r => {
            const day = (r.registered_at || '').split('T')[0] || 'unknown';
            timeline[day] = (timeline[day] || 0) + 1;
        });

        let cumulative = 0;
        const timelineCumulative = Object.entries(timeline).map(([date, count]) => {
            cumulative += count;
            return { date, count, cumulative };
        });

        const fillRate = event.capacity > 0 ? Math.round((event.registered_count / event.capacity) * 100) : 0;
        const daysUntilEvent = Math.ceil((new Date(event.date) - new Date()) / 86400000);

        res.json({
            event,
            analytics: {
                views: analytics?.views || 0, shares: analytics?.shares || 0,
                fillRate, daysUntilEvent,
                registrationsPerDay: timeline, registrationTimeline: timelineCumulative,
                avgRegsPerDay: timelineCumulative.length > 0 ? Math.round(event.registered_count / timelineCumulative.length) : 0
            }
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/organiser/events/:id/export
router.get('/events/:id/export', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { data: event } = await supabase.from('events').select('id, title, created_by').eq('id', eventId).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.created_by !== req.userId) return res.status(403).json({ error: 'Access denied' });

        const { data: regs } = await supabase.from('registrations').select('*, users(name, email, phone, department, year, college, cu_id)').eq('event_id', eventId).order('registered_at');

        const headers = ['S.No', 'Name', 'Email', 'Phone', 'CU ID', 'College', 'Department', 'Year', 'Status', 'Registered At'];
        const rows = (regs || []).map((r, i) => [
            i + 1,
            `"${(r.participant_name || r.users?.name || '').replace(/"/g, '""')}"`,
            r.email || r.users?.email || '',
            r.participant_phone || r.users?.phone || '',
            r.uid || r.users?.cu_id || '',
            `"${(r.participant_college || r.users?.college || '').replace(/"/g, '""')}"`,
            r.users?.department || '', r.users?.year || '', r.status || 'confirmed', r.registered_at || ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_')}_attendees.csv"`);
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/organiser/events/:id/notify
router.post('/events/:id/notify', async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { message } = req.body;
        if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });

        const { data: event } = await supabase.from('events').select('id, title, created_by').eq('id', eventId).single();
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.created_by !== req.userId) return res.status(403).json({ error: 'Access denied' });

        const { data: regs } = await supabase.from('registrations').select('user_id').eq('event_id', eventId);
        const userIds = [...new Set((regs || []).map(r => r.user_id))];

        if (userIds.length === 0) return res.json({ message: 'No attendees to notify', sent: 0 });

        const notifications = userIds.map(uid => ({
            user_id: uid, message: `📢 [${event.title}]: ${message.trim()}`, type: 'info'
        }));
        await supabase.from('notifications').insert(notifications);

        res.json({ message: `Notification sent to ${userIds.length} attendees`, sent: userIds.length });
    } catch (err) {
        console.error('Notify error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
