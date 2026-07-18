// ============================================
// CU EVENT MANAGEMENT - API CLIENT
// (Role-Based + Open Registration)
// ============================================

const API = {
    BASE: '/api',

    // Token management
    getToken() { return localStorage.getItem('cu_token'); },
    setToken(t) { t ? localStorage.setItem('cu_token', t) : localStorage.removeItem('cu_token'); },
    isLoggedIn() { return !!this.getToken(); },

    async request(method, path, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        const token = this.getToken();
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(this.BASE + path, opts);

        // Handle 401 — auto logout
        if (res.status === 401) {
            this.setToken(null);
            if (typeof AppState !== 'undefined') {
                AppState.currentUser = null;
                if (typeof updateAuthUI === 'function') updateAuthUI();
            }
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw data;
        return data;
    },

    get(path) { return this.request('GET', path); },
    post(path, body) { return this.request('POST', path, body); },
    put(path, body) { return this.request('PUT', path, body); },
    del(path) { return this.request('DELETE', path); },

    // ===== AUTH =====
    signup(user) {
        return this.post('/auth/signup', user).then(d => { this.setToken(d.token); return d; });
    },
    login(identifier, password) {
        return this.post('/auth/login', { identifier, password }).then(d => { this.setToken(d.token); return d; });
    },
    demoLogin(role) {
        return this.post('/auth/demo-login', { role }).then(d => { this.setToken(d.token); return d; });
    },
    logout() { this.setToken(null); },
    getProfile() { return this.get('/auth/me'); },
    updateProfile(data) { return this.put('/auth/profile', data); },
    changePassword(data) { return this.post('/auth/change-password', data); },

    // ===== EVENTS =====
    getEvents(params = {}) {
        const q = new URLSearchParams(params).toString();
        return this.get('/events' + (q ? '?' + q : ''));
    },
    getEvent(id) { return this.get('/events/' + id); },
    getFeaturedEvents() { return this.get('/events/featured'); },
    createEvent(data) { return this.post('/events', data); },
    updateEvent(id, data) { return this.put('/events/' + id, data); },
    deleteEvent(id) { return this.del('/events/' + id); },

    // ===== REGISTRATION =====
    sendOtp(data) { return this.post('/register/send-otp', data); },
    verifyOtp(data) { return this.post('/register/verify-otp', data); },
    getRegistrations() { return this.get('/registrations'); },
    cancelRegistration(eventId) { return this.del('/registrations/' + eventId); },

    // ===== FAVORITES =====
    toggleFavorite(eventId) { return this.post('/favorites/' + eventId); },
    getFavorites() { return this.get('/favorites'); },

    // ===== NOTIFICATIONS =====
    getNotifications() { return this.get('/notifications'); },
    markAllRead() { return this.put('/notifications/read-all'); },
    deleteNotification(id) { return this.del('/notifications/' + id); },

    // ===== DASHBOARD =====
    getDashboardStats() { return this.get('/dashboard/stats'); },

    // ===== CLUBS =====
    getClubs() { return this.get('/clubs'); },
    getClub(id) { return this.get('/clubs/' + id); },
    joinClub(id) { return this.post('/clubs/' + id + '/join'); },
    verifyClubOtp(id, otp) { return this.post('/clubs/' + id + '/verify', { otp }); },
    leaveClub(id) { return this.del('/clubs/' + id + '/leave'); },
    getMyClubs() { return this.get('/clubs/my/memberships'); },

    // ===== ORGANISER =====
    getOrganiserStats() { return this.get('/organiser/stats'); },
    getEventAttendees(eventId) { return this.get('/organiser/events/' + eventId + '/attendees'); },
    getEventAnalytics(eventId) { return this.get('/organiser/events/' + eventId + '/analytics'); },
    exportAttendees(eventId) {
        // Direct download — open in new tab
        const token = this.getToken();
        window.open(this.BASE + '/organiser/events/' + eventId + '/export?token=' + token, '_blank');
    },
    notifyAttendees(eventId, message) { return this.post('/organiser/events/' + eventId + '/notify', { message }); }
};
