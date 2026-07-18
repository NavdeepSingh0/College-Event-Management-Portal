const express = require('express');
const supabase = require('../db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function safeJSON(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch (_) { return []; }
}

// GET /api/events — List with filters + pagination
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { category, search, date, price, venue, sort, page = 1, limit = 12, featured, created_by } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        let query = supabase.from('events').select('*', { count: 'exact' });

        if (created_by === 'me' && req.userId) query = query.eq('created_by', req.userId);
        if (category) query = query.eq('category', category);
        if (featured === '1') query = query.eq('featured', 1);
        if (venue) query = query.ilike('venue', `%${venue}%`);
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,organizer.ilike.%${search}%`);

        const today = new Date().toISOString().split('T')[0];
        if (date === 'today') query = query.eq('date', today);
        else if (date === 'week') query = query.gte('date', today).lte('date', new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
        else if (date === 'month') query = query.gte('date', today).lte('date', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);

        if (price === 'free') query = query.eq('price', 'Free');
        else if (price === 'paid') query = query.neq('price', 'Free');

        if (sort === 'date_desc') query = query.order('date', { ascending: false });
        else if (sort === 'popular') query = query.order('registered_count', { ascending: false });
        else if (sort === 'title') query = query.order('title', { ascending: true });
        else query = query.order('date', { ascending: true });

        query = query.range(offset, offset + limitNum - 1);

        const { data: events, error, count } = await query;
        if (error) throw error;

        // Get user's favorites and registrations
        let userFavs = new Set(), userRegs = new Set();
        if (req.userId) {
            const { data: favs } = await supabase.from('favorites').select('event_id').eq('user_id', req.userId);
            const { data: regs } = await supabase.from('registrations').select('event_id').eq('user_id', req.userId);
            (favs || []).forEach(f => userFavs.add(f.event_id));
            (regs || []).forEach(r => userRegs.add(r.event_id));
        }

        const parsed = (events || []).map(e => ({
            ...e,
            highlights: safeJSON(e.highlights),
            tags: safeJSON(e.tags),
            speakers: safeJSON(e.speakers),
            agenda: safeJSON(e.agenda),
            isFavorite: userFavs.has(e.id),
            isRegistered: userRegs.has(e.id)
        }));

        res.json({ events: parsed, total: count || 0, page: pageNum, totalPages: Math.ceil((count || 0) / limitNum) });
    } catch (err) {
        console.error('Events list error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/events/featured
router.get('/featured', optionalAuth, async (req, res) => {
    try {
        const { data: events, error } = await supabase.from('events').select('*').eq('featured', 1).order('date').limit(6);
        if (error) throw error;

        let userFavs = new Set(), userRegs = new Set();
        if (req.userId) {
            const { data: favs } = await supabase.from('favorites').select('event_id').eq('user_id', req.userId);
            const { data: regs } = await supabase.from('registrations').select('event_id').eq('user_id', req.userId);
            (favs || []).forEach(f => userFavs.add(f.event_id));
            (regs || []).forEach(r => userRegs.add(r.event_id));
        }

        const parsed = (events || []).map(e => ({
            ...e, highlights: safeJSON(e.highlights), tags: safeJSON(e.tags),
            isFavorite: userFavs.has(e.id), isRegistered: userRegs.has(e.id)
        }));
        res.json({ events: parsed });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/events/:id
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { data: event, error } = await supabase.from('events').select('*').eq('id', req.params.id).single();
        if (error || !event) return res.status(404).json({ error: 'Event not found' });

        let isFavorite = false, isRegistered = false;
        if (req.userId) {
            const { data: fav } = await supabase.from('favorites').select('user_id').eq('user_id', req.userId).eq('event_id', event.id).maybeSingle();
            const { data: reg } = await supabase.from('registrations').select('user_id').eq('user_id', req.userId).eq('event_id', event.id).maybeSingle();
            isFavorite = !!fav;
            isRegistered = !!reg;
        }

        const { data: related } = await supabase.from('events').select('*').eq('category', event.category).neq('id', event.id).limit(3);

        res.json({
            event: {
                ...event,
                highlights: safeJSON(event.highlights), tags: safeJSON(event.tags),
                speakers: safeJSON(event.speakers), agenda: safeJSON(event.agenda),
                isFavorite, isRegistered,
                relatedEvents: (related || []).map(e => ({ ...e, highlights: safeJSON(e.highlights), tags: safeJSON(e.tags) }))
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/events
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log(`📝 POST /api/events by userId=${req.userId}`, { title: req.body.title, category: req.body.category, date: req.body.date });
        const { title, category, organizer, organizerLogo, date, startTime, endTime, venue, location, price, capacity, description, highlights, tags, certificate, speakers, agenda, featured, visibility, allowExternal, posterUrl } = req.body;
        if (!title || !category || !date) return res.status(400).json({ error: 'Title, category, and date are required' });

        const { data: event, error } = await supabase.from('events').insert({
            title, category,
            organizer: organizer || null,
            organizer_logo: organizerLogo || null,
            date, start_time: startTime || null, end_time: endTime || null,
            venue: venue || null,
            location: location || 'Chandigarh University, Gharuan',
            price: price || 'Free',
            capacity: capacity || 100,
            description: description || null,
            highlights: highlights || [],
            tags: tags || [],
            certificate: certificate ? 1 : 0,
            speakers: speakers || [],
            agenda: agenda || [],
            featured: featured ? 1 : 0,
            poster_url: posterUrl || null,
            visibility: visibility || 'public',
            allow_external: allowExternal !== undefined ? (allowExternal ? 1 : 0) : 1,
            created_by: req.userId
        }).select().single();

        if (error) throw error;

        await supabase.from('notifications').insert({
            user_id: req.userId,
            message: `Your event "${title}" has been created successfully!`,
            type: 'success'
        });

        console.log(`✅ Event created: id=${event.id} title="${title}"`);
        res.status(201).json({ event: { ...event, highlights: safeJSON(event.highlights), tags: safeJSON(event.tags) } });
    } catch (err) {
        console.error('❌ Event creation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/events/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { data: existing } = await supabase.from('events').select('created_by').eq('id', eventId).single();
        if (!existing) return res.status(404).json({ error: 'Event not found' });
        if (existing.created_by !== req.userId) return res.status(403).json({ error: 'You can only edit your own events' });

        const { title, category, date, startTime, endTime, venue, location, price, capacity, description, highlights, tags, certificate, featured, visibility, allowExternal, posterUrl } = req.body;
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (category !== undefined) updates.category = category;
        if (date !== undefined) updates.date = date;
        if (startTime !== undefined) updates.start_time = startTime;
        if (endTime !== undefined) updates.end_time = endTime;
        if (venue !== undefined) updates.venue = venue;
        if (location !== undefined) updates.location = location;
        if (price !== undefined) updates.price = price;
        if (capacity !== undefined) updates.capacity = capacity;
        if (description !== undefined) updates.description = description;
        if (highlights !== undefined) updates.highlights = highlights;
        if (tags !== undefined) updates.tags = tags;
        if (certificate !== undefined) updates.certificate = certificate ? 1 : 0;
        if (featured !== undefined) updates.featured = featured ? 1 : 0;
        if (visibility !== undefined) updates.visibility = visibility;
        if (allowExternal !== undefined) updates.allow_external = allowExternal ? 1 : 0;
        if (posterUrl !== undefined) updates.poster_url = posterUrl;

        const { data: event, error } = await supabase.from('events').update(updates).eq('id', eventId).select().single();
        if (error) throw error;

        res.json({ event: { ...event, highlights: safeJSON(event.highlights), tags: safeJSON(event.tags) } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/events/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { data: existing } = await supabase.from('events').select('created_by').eq('id', eventId).single();
        if (!existing) return res.status(404).json({ error: 'Event not found' });
        if (existing.created_by !== req.userId) return res.status(403).json({ error: 'You can only delete your own events' });

        await supabase.from('registrations').delete().eq('event_id', eventId);
        await supabase.from('favorites').delete().eq('event_id', eventId);
        await supabase.from('event_analytics').delete().eq('event_id', eventId);
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (error) throw error;

        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
