// ===== DASHBOARD PAGE — PREMIUM REDESIGN =====
document.addEventListener('DOMContentLoaded', () => {
    waitForAuth().then(() => {
        if (!AppState.isLoggedIn()) {
            showToast('Please login to access dashboard', 'warning');
            setTimeout(() => openAuthModal('login'), 500);
        }
        updateDashProfile();
        const hash = window.location.hash.replace('#', '');
        const validTabs = ['overview', 'registered', 'created', 'favorites', 'clubs', 'notifications', 'settings'];
        const initialTab = validTabs.includes(hash) ? hash : 'overview';
        switchTab(initialTab);
    });
});

function waitForAuth() {
    return new Promise(resolve => {
        if (!API.isLoggedIn()) return resolve();
        let tries = 0;
        const check = () => {
            if (AppState.currentUser || tries > 30) return resolve();
            tries++;
            setTimeout(check, 100);
        };
        check();
    });
}

function updateDashProfile() {
    const u = AppState.currentUser;
    if (!u) return;
    const av = document.getElementById('dashAvatar');
    const nm = document.getElementById('dashName');
    const id = document.getElementById('dashId');
    const tags = document.getElementById('dashTags');
    if (av) av.textContent = u.name?.charAt(0)?.toUpperCase() || '?';
    if (nm) nm.textContent = u.name || 'Guest';
    if (id) id.textContent = `${u.cu_id || u.cuId || ''} • ${u.email || ''}`;
    if (tags) {
        const tagItems = [];
        if (u.department) tagItems.push(u.department);
        if (u.year) tagItems.push(u.year);
        tagItems.push('Active Member');
        tags.innerHTML = tagItems.map(t => `<span class="dash-hero__tag">${t}</span>`).join('');
    }
}

async function switchTab(tab, el) {
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        document.querySelectorAll('.dash-tab').forEach(t => {
            if (t.dataset.tab === tab) t.classList.add('active');
        });
    }
    history.replaceState(null, '', `#${tab}`);

    const content = document.getElementById('dashContent');
    const u = AppState.currentUser;
    if (!u) {
        content.innerHTML = `<div class="dash-empty">
            <h3>Authentication Required</h3>
            <p>Please login to access your dashboard</p>
            <button class="btn btn-primary" onclick="openAuthModal('login')">Login Now</button>
        </div>`;
        return;
    }

    content.innerHTML = '<div class="dash-loading"><div class="dash-loading__spinner"></div><p>Loading...</p></div>';

    const tabs = {
        overview: renderOverview,
        registered: renderRegistered,
        created: renderCreated,
        favorites: renderFavorites,
        clubs: renderClubs,
        notifications: renderNotifications,
        settings: renderSettings
    };
    try {
        await (tabs[tab] || tabs.overview)(content);
    } catch (err) {
        content.innerHTML = `<div class="dash-empty">
            <h3>Something went wrong</h3>
            <p>${err.error || err.message || 'Please try again'}</p>
            <button class="btn btn-secondary" onclick="switchTab('${tab}')">Retry</button>
        </div>`;
    }
}

// ===== OVERVIEW TAB =====
async function renderOverview(el) {
    let stats = {}, upcoming = [];
    try {
        const data = await API.getDashboardStats();
        stats = data.stats || {};
        upcoming = data.upcoming || [];
    } catch (e) {
        stats = { registrations: AppState.registrations.length, favorites: AppState.favorites.length, created: 0, unread: AppState.getUnreadCount() };
    }

    const regBadge = document.getElementById('regBadge');
    if (regBadge && stats.registrations) { regBadge.textContent = stats.registrations; regBadge.style.display = 'flex'; }
    const notifBadge = document.getElementById('notifBadgeTab');
    if (notifBadge && stats.unread) { notifBadge.textContent = stats.unread; notifBadge.style.display = 'flex'; }

    const greeting = getGreeting();
    const name = AppState.currentUser.name?.split(' ')[0] || 'there';

    el.innerHTML = `
    <div class="dash-overview">
        <div class="dash-greeting fade-in">
            <h2>${greeting}, ${name}!</h2>
            <p>Here's what's happening with your campus events</p>
        </div>

        <div class="dash-stats-grid fade-in">
            <div class="dash-stat-card dash-stat-card--blue">
                <div class="dash-stat-card__info">
                    <div class="dash-stat-card__value">${stats.registrations || 0}</div>
                    <div class="dash-stat-card__label">Events Registered</div>
                </div>
                <button class="dash-stat-card__action" onclick="switchTab('registered')">View</button>
            </div>
            <div class="dash-stat-card dash-stat-card--purple">
                <div class="dash-stat-card__info">
                    <div class="dash-stat-card__value">${stats.created || 0}</div>
                    <div class="dash-stat-card__label">Events Created</div>
                </div>
                <button class="dash-stat-card__action" onclick="switchTab('created')">View</button>
            </div>
            <div class="dash-stat-card dash-stat-card--pink">
                <div class="dash-stat-card__info">
                    <div class="dash-stat-card__value">${stats.favorites || 0}</div>
                    <div class="dash-stat-card__label">Saved Events</div>
                </div>
                <button class="dash-stat-card__action" onclick="switchTab('favorites')">View</button>
            </div>
            <div class="dash-stat-card dash-stat-card--amber">
                <div class="dash-stat-card__info">
                    <div class="dash-stat-card__value">${stats.unread || 0}</div>
                    <div class="dash-stat-card__label">Unread Alerts</div>
                </div>
                <button class="dash-stat-card__action" onclick="switchTab('notifications')">View</button>
            </div>
        </div>

        <div class="dash-overview__grid">
            <div class="dash-card fade-in">
                <div class="dash-card__header">
                    <h3>Upcoming Events</h3>
                    <a href="events.html" class="dash-card__link">Browse All</a>
                </div>
                <div class="dash-card__body">
                    ${upcoming.length > 0 ? upcoming.map(e => `
                    <a href="event-details.html?id=${e.id}" class="dash-upcoming-item">
                        <div class="dash-upcoming-item__left">
                            <div class="dash-upcoming-item__date">
                                <span class="dash-upcoming-item__day">${new Date(e.date).getDate()}</span>
                                <span class="dash-upcoming-item__month">${new Date(e.date).toLocaleString('en', {month: 'short'})}</span>
                            </div>
                            <div class="dash-upcoming-item__info">
                                <h4>${e.title}</h4>
                                <p>${e.venue || 'CU Campus'} ${e.start_time ? ' • ' + formatCalTime(e.start_time) : ''}</p>
                            </div>
                        </div>
                        <span class="dash-upcoming-item__cat" style="background:${(categoryColors || {})[e.category] || '#6B7280'}20;color:${(categoryColors || {})[e.category] || '#6B7280'}">${e.category || 'Event'}</span>
                    </a>`).join('') : `
                    <div class="dash-card__empty">
                        <p>No upcoming registered events</p>
                        <a href="events.html" class="btn btn-sm btn-primary">Explore Events</a>
                    </div>`}
                </div>
            </div>

            <div class="dash-card fade-in">
                <div class="dash-card__header">
                    <h3>Quick Actions</h3>
                </div>
                <div class="dash-card__body">
                    <div class="dash-actions-grid">
                        <a href="create-event.html" class="dash-action-item">
                            <div class="dash-action-item__text">
                                <h4>Create Event</h4>
                                <p>Share with 30,000+ students</p>
                            </div>
                        </a>
                        <a href="events.html" class="dash-action-item">
                            <div class="dash-action-item__text">
                                <h4>Browse Events</h4>
                                <p>Discover new experiences</p>
                            </div>
                        </a>
                        <a href="calendar.html" class="dash-action-item">
                            <div class="dash-action-item__text">
                                <h4>View Calendar</h4>
                                <p>See events by date</p>
                            </div>
                        </a>
                        <a href="clubs.html" class="dash-action-item">
                            <div class="dash-action-item__text">
                                <h4>Join Clubs</h4>
                                <p>Connect with communities</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    setTimeout(initScrollAnimations, 50);
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function formatCalTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    if (isNaN(hour)) return timeStr;
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

// ===== REGISTERED TAB =====
async function renderRegistered(el) {
    const data = await API.getRegistrations();
    const regs = data.registrations || [];
    if (regs.length === 0) {
        el.innerHTML = `<div class="dash-empty">
            <h3>No registered events yet</h3>
            <p>Start exploring and register for exciting events!</p>
            <a href="events.html" class="btn btn-primary">Browse Events</a>
        </div>`;
        return;
    }
    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header">
            <h2>My Registrations</h2>
            <span class="dash-section__count">${regs.length} event${regs.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="dash-list">
            ${regs.map(r => {
                const catColor = (categoryColors || {})[r.category] || '#6B7280';
                return `
                <div class="dash-list-item">
                    <div class="dash-list-item__accent" style="background:${catColor}"></div>
                    <div class="dash-list-item__body">
                        <div class="dash-list-item__top">
                            <a href="event-details.html?id=${r.event_id}" class="dash-list-item__title">${r.title || 'Event'}</a>
                            <span class="dash-list-item__status dash-list-item__status--${r.status || 'confirmed'}">${r.status || 'confirmed'}</span>
                        </div>
                        <div class="dash-list-item__meta">
                            <span>Date: ${formatDate(r.date)}</span>
                            ${r.start_time ? `<span>Time: ${formatCalTime(r.start_time)}</span>` : ''}
                            <span>Venue: ${r.venue || 'CU Campus'}</span>
                        </div>
                        <div class="dash-list-item__bottom">
                            <span class="dash-list-item__cat" style="color:${catColor}">${r.category || ''}</span>
                            <div class="dash-list-item__actions">
                                <a href="event-details.html?id=${r.event_id}" class="btn btn-sm btn-secondary">View</a>
                                <button class="btn btn-sm btn-danger-outline" onclick="cancelReg(${r.event_id}, '${(r.title || '').replace(/'/g, "\\'")}')">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    </div>`;
}

async function cancelReg(eventId, title) {
    if (!confirm(`Cancel registration for "${title}"?`)) return;
    try {
        await API.cancelRegistration(eventId);
        await AppState.loadUserData();
        showToast('Registration cancelled', 'info');
        switchTab('registered');
    } catch (err) {
        showToast(err.error || 'Failed to cancel', 'error');
    }
}

// ===== CREATED EVENTS TAB =====
async function renderCreated(el) {
    const data = await API.getEvents({ created_by: 'me' });
    const events = data.events || [];
    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header">
            <h2>My Created Events</h2>
            <a href="create-event.html" class="btn btn-sm btn-primary">Create New</a>
        </div>`;
    if (events.length === 0) {
        el.innerHTML += `<div class="dash-empty">
            <h3>No events created yet</h3>
            <p>Create your first event and share it with 30,000+ CU students!</p>
            <a href="create-event.html" class="btn btn-primary">Create Your First Event</a>
        </div>`;
        return;
    }
    el.innerHTML += `<div class="dash-list">
        ${events.map(e => {
            const catColor = (categoryColors || {})[e.category] || '#6B7280';
            const pct = Math.round(((e.registered_count || 0) / (e.capacity || 1)) * 100);
            return `
            <div class="dash-list-item">
                <div class="dash-list-item__accent" style="background:${catColor}"></div>
                <div class="dash-list-item__body">
                    <div class="dash-list-item__top">
                        <a href="event-details.html?id=${e.id}" class="dash-list-item__title">${e.title}</a>
                        <span class="dash-list-item__cat-badge" style="background:${catColor}15;color:${catColor}">${e.category}</span>
                    </div>
                    <div class="dash-list-item__meta">
                        <span>Date: ${formatDate(e.date)}</span>
                        ${e.start_time ? `<span>Time: ${formatCalTime(e.start_time)}</span>` : ''}
                        <span>Venue: ${e.venue || 'TBD'}</span>
                    </div>
                    <div class="dash-list-item__progress">
                        <div class="dash-list-item__progress-bar"><div class="dash-list-item__progress-fill" style="width:${pct}%;background:${pct > 80 ? '#ef4444' : catColor}"></div></div>
                        <span>Registered: ${e.registered_count || 0}/${e.capacity} (${pct}%)</span>
                    </div>
                    <div class="dash-list-item__bottom">
                        <span class="dash-list-item__price">${e.price || 'Free'}</span>
                        <div class="dash-list-item__actions">
                            <a href="event-details.html?id=${e.id}" class="btn btn-sm btn-secondary">View</a>
                            <button class="btn btn-sm btn-danger-outline" onclick="deleteMyEvent(${e.id}, '${e.title.replace(/'/g, "\\'")}')">Delete</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('')}
    </div></div>`;
}

async function deleteMyEvent(id, title) {
    if (!confirm(`Delete event "${title}"? This cannot be undone.`)) return;
    try {
        await API.deleteEvent(id);
        showToast('Event deleted', 'success');
        switchTab('created');
    } catch (err) {
        showToast(err.error || 'Failed to delete', 'error');
    }
}

// ===== FAVORITES TAB =====
async function renderFavorites(el) {
    const data = await API.getFavorites();
    const favs = data.favorites || [];
    if (favs.length === 0) {
        el.innerHTML = `<div class="dash-empty">
            <h3>No saved events</h3>
            <p>Start exploring and save events you're interested in!</p>
            <a href="events.html" class="btn btn-primary">Browse Events</a>
        </div>`;
        return;
    }
    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header">
            <h2>Saved Events</h2>
            <span class="dash-section__count">${favs.length} saved</span>
        </div>
        <div class="events-grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));">
            ${favs.map(e => renderEventCard(e)).join('')}
        </div>
    </div>`;
    setTimeout(initScrollAnimations, 50);
}

// ===== CLUBS TAB =====
async function renderClubs(el) {
    try {
        const data = await API.getMyClubs();
        const memberships = data.memberships || [];
        if (memberships.length === 0) {
            el.innerHTML = `<div class="dash-empty">
                <h3>No club memberships</h3>
                <p>Join clubs to connect with students who share your interests!</p>
                <a href="clubs.html" class="btn btn-primary">Explore Clubs</a>
            </div>`;
            return;
        }
        el.innerHTML = `
        <div class="dash-section">
            <div class="dash-section__header">
                <h2>My Club Memberships</h2>
                <a href="clubs.html" class="btn btn-sm btn-secondary">Explore More Clubs</a>
            </div>
            <div class="dash-clubs-grid">
                ${memberships.map(m => `
                <div class="dash-club-card">
                    <div class="dash-club-card__body">
                        <h4>${m.club_name}</h4>
                        <p>Joined ${new Date(m.joined_at).toLocaleDateString('en-IN', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                    </div>
                    <span class="dash-club-card__badge">Member</span>
                </div>`).join('')}
            </div>
        </div>`;
    } catch (err) {
        el.innerHTML = `<div class="dash-empty">
            <h3>No club memberships yet</h3>
            <p>Join clubs to get started!</p>
            <a href="clubs.html" class="btn btn-primary">Explore Clubs</a>
        </div>`;
    }
}

// ===== NOTIFICATIONS TAB =====
async function renderNotifications(el) {
    const data = await API.getNotifications();
    const notifs = data.notifications || [];
    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header">
            <div>
                <h2>Notifications</h2>
                <p class="dash-section__subtitle">${data.unreadCount || 0} unread notification${(data.unreadCount || 0) !== 1 ? 's' : ''}</p>
            </div>
            <div style="display:flex;gap:0.5rem;">
                ${notifs.length > 0 ? `
                <button class="btn btn-sm btn-secondary" onclick="markAllRead()">Mark all read</button>
                <button class="btn btn-sm btn-danger-outline" onclick="clearAllNotifs()">Clear all</button>
                ` : ''}
            </div>
        </div>`;
    if (notifs.length === 0) {
        el.innerHTML += `<div class="dash-empty">
            <h3>All caught up!</h3>
            <p>No notifications to show right now</p>
        </div></div>`;
        return;
    }

    const groups = {};
    notifs.forEach(n => {
        const group = getNotifDateGroup(n.created_at);
        if (!groups[group]) groups[group] = [];
        groups[group].push(n);
    });

    let html = '';
    for (const [label, items] of Object.entries(groups)) {
        html += `<div class="dash-notif-group">
            <div class="dash-notif-group__label">${label}</div>`;
        items.forEach(n => {
            const unread = !n.read ? 'unread' : '';
            html += `<div class="dash-notif-item ${unread}">
                <div class="dash-notif-item__body">
                    <div class="dash-notif-item__message">${n.message}</div>
                    <div class="dash-notif-item__time">${relativeTime(n.created_at)}</div>
                </div>
                <div class="dash-notif-item__actions">
                    <button onclick="deleteNotif(${n.id})" title="Delete">Remove</button>
                </div>
            </div>`;
        });
        html += '</div>';
    }
    el.innerHTML += html + '</div>';
}

async function markAllRead() {
    try {
        await API.markAllRead();
        AppState._unreadCount = 0;
        AppState.notifications.forEach(n => n.read = 1);
        updateNotifBadge();
        const notifBadge = document.getElementById('notifBadgeTab');
        if (notifBadge) notifBadge.style.display = 'none';
        switchTab('notifications');
        showToast('All notifications marked as read', 'success');
    } catch (err) {
        showToast(err.error || 'Failed', 'error');
    }
}

async function deleteNotif(id) {
    try {
        await API.deleteNotification(id);
        switchTab('notifications');
    } catch (err) {
        showToast('Failed to delete', 'error');
    }
}

async function clearAllNotifs() {
    if (!confirm('Delete all notifications?')) return;
    try {
        const data = await API.getNotifications();
        const ids = (data.notifications || []).map(n => n.id);
        await Promise.all(ids.map(id => API.deleteNotification(id)));
        AppState.notifications = [];
        AppState._unreadCount = 0;
        updateNotifBadge();
        switchTab('notifications');
        showToast('All notifications cleared', 'success');
    } catch (err) {
        showToast('Failed to clear', 'error');
    }
}

// ===== SETTINGS TAB =====
function renderSettings(el) {
    const u = AppState.currentUser;
    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header"><h2>Account Settings</h2></div>

        <div class="dash-settings">
            <div class="dash-settings__card">
                <div class="dash-settings__card-header">
                    <h3>Profile Information</h3>
                    <p>Update your personal details</p>
                </div>
                <div class="dash-settings__card-body">
                    <div class="dash-settings__form-row">
                        <div class="form-group"><label>Full Name</label><input type="text" value="${u.name || ''}" id="setName" placeholder="Your name"></div>
                        <div class="form-group"><label>Phone</label><input type="tel" value="${u.phone || ''}" id="setPhone" placeholder="+91-XXXXXXXXXX"></div>
                    </div>
                    <div class="dash-settings__form-row">
                        <div class="form-group"><label>Email <span class="dash-settings__locked">Locked</span></label><input type="email" value="${u.email || ''}" disabled></div>
                        <div class="form-group"><label>CU ID <span class="dash-settings__locked">Locked</span></label><input type="text" value="${u.cu_id || u.cuId || ''}" disabled></div>
                    </div>
                    <div class="dash-settings__form-row">
                        <div class="form-group"><label>Department</label><input type="text" value="${u.department || ''}" id="setDept" placeholder="e.g. CSE"></div>
                        <div class="form-group"><label>Year</label><input type="text" value="${u.year || ''}" id="setYear" placeholder="e.g. 3rd Year"></div>
                    </div>
                    <button class="btn btn-primary" onclick="saveSettings()">Save Changes</button>
                </div>
            </div>

            <div class="dash-settings__card">
                <div class="dash-settings__card-header">
                    <h3>Security</h3>
                    <p>Change your password</p>
                </div>
                <div class="dash-settings__card-body">
                    <div class="dash-settings__form-row">
                        <div class="form-group"><label>Current Password</label><input type="password" id="curPass" placeholder="Enter current password"></div>
                        <div class="form-group"><label>New Password</label><input type="password" id="newPass" placeholder="Min 6 characters"></div>
                    </div>
                    <button class="btn btn-secondary" onclick="changePassword()">Change Password</button>
                </div>
            </div>

            <div class="dash-settings__card dash-settings__card--danger">
                <div class="dash-settings__card-header">
                    <h3>Account</h3>
                    <p>Session management</p>
                </div>
                <div class="dash-settings__card-body">
                    <button class="btn btn-danger-outline" onclick="logout()">Logout from this device</button>
                </div>
            </div>
        </div>
    </div>`;
}

async function saveSettings() {
    try {
        const data = await API.updateProfile({
            name: document.getElementById('setName').value,
            phone: document.getElementById('setPhone').value,
            department: document.getElementById('setDept').value,
            year: document.getElementById('setYear').value
        });
        AppState.currentUser = data.user;
        updateDashProfile();
        updateAuthUI();
        showToast('Settings saved!', 'success');
    } catch (err) {
        showToast(err.error || 'Failed to save', 'error');
    }
}

async function changePassword() {
    const curPass = document.getElementById('curPass').value;
    const newPass = document.getElementById('newPass').value;
    if (!curPass || !newPass) { showToast('Please fill both fields', 'error'); return; }
    try {
        await API.changePassword({ currentPassword: curPass, newPassword: newPass });
        showToast('Password changed successfully!', 'success');
        document.getElementById('curPass').value = '';
        document.getElementById('newPass').value = '';
    } catch (err) {
        showToast(err.error || 'Failed to change password', 'error');
    }
}
