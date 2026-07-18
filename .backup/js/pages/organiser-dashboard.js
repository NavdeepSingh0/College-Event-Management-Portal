// ===== ORGANISER DASHBOARD — FULL FEATURED =====
let orgState = { events: [], stats: null, selectedEventId: null };

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof AppState !== 'undefined' && AppState.ready) await AppState.ready;
    if (!AppState.isLoggedIn()) {
        showToast('Please login to access organiser dashboard', 'warning');
        setTimeout(() => openAuthModal('login'), 500);
        return;
    }
    if (AppState.currentUser?.role !== 'organiser') {
        showToast('This dashboard is for organisers only', 'warning');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        return;
    }
    updateOrgProfile();
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['overview', 'events', 'analytics', 'attendees', 'marketing', 'settings'];
    orgSwitchTab(validTabs.includes(hash) ? hash : 'overview');
});

function updateOrgProfile() {
    const u = AppState.currentUser;
    if (!u) return;
    const av = document.getElementById('dashAvatar');
    const nm = document.getElementById('dashName');
    const id = document.getElementById('dashId');
    const tags = document.getElementById('dashTags');
    if (av) av.textContent = u.name?.charAt(0)?.toUpperCase() || '?';
    if (nm) nm.textContent = u.name || 'Organiser';
    if (id) id.textContent = u.organization_name || u.email || '';
    if (tags) {
        const tagItems = [];
        if (u.organization_type) tagItems.push(u.organization_type.replace(/_/g, ' '));
        if (u.department) tagItems.push(u.department);
        tagItems.push('Organiser');
        tags.innerHTML = tagItems.map(t => `<span class="dash-hero__tag">${t}</span>`).join('');
    }
}

async function orgSwitchTab(tab, el) {
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
    if (!AppState.currentUser || AppState.currentUser.role !== 'organiser') {
        content.innerHTML = `<div class="dash-empty"><h3>Organiser Access Required</h3><p>Please login with an organiser account.</p></div>`;
        return;
    }

    content.innerHTML = '<div class="dash-loading"><div class="dash-loading__spinner"></div><p>Loading...</p></div>';

    const tabs = {
        overview: renderOrgOverview,
        events: renderOrgEvents,
        analytics: renderOrgAnalytics,
        attendees: renderOrgAttendees,
        marketing: renderOrgMarketing,
        settings: renderOrgSettings
    };
    try {
        await (tabs[tab] || tabs.overview)(content);
    } catch (err) {
        content.innerHTML = `<div class="dash-empty"><h3>Something went wrong</h3><p>${err.error || err.message || 'Please try again'}</p><button class="btn btn-secondary" onclick="orgSwitchTab('${tab}')">Retry</button></div>`;
    }
}

// ===== OVERVIEW =====
async function renderOrgOverview(el) {
    const data = await API.getOrganiserStats();
    orgState.stats = data.stats;
    orgState.events = data.events || [];

    const s = data.stats;
    const name = AppState.currentUser.name?.split(' ')[0] || 'there';
    const greeting = getOrgGreeting();

    el.innerHTML = `
    <div class="dash-overview">
        <div class="dash-greeting fade-in">
            <h2>${greeting}, ${name}!</h2>
            <p>Here's an overview of your event management activity</p>
        </div>

        <div class="org-stats-grid fade-in">
            <div class="org-stat-card org-stat-card--blue">
                <div class="org-stat-card__icon">🎫</div>
                <div class="org-stat-card__value">${s.totalEvents}</div>
                <div class="org-stat-card__label">Total Events</div>
                <div class="org-stat-card__sub">${s.liveEvents} live • ${s.pastEvents} past</div>
            </div>
            <div class="org-stat-card org-stat-card--green">
                <div class="org-stat-card__icon">👥</div>
                <div class="org-stat-card__value">${s.totalRegistrations.toLocaleString()}</div>
                <div class="org-stat-card__label">Total Registrations</div>
                <div class="org-stat-card__sub">${s.recentRegs} this week</div>
            </div>
            <div class="org-stat-card org-stat-card--purple">
                <div class="org-stat-card__icon">📈</div>
                <div class="org-stat-card__value">${s.avgFillRate}%</div>
                <div class="org-stat-card__label">Avg Fill Rate</div>
                <div class="org-stat-card__sub">${s.totalCapacity.toLocaleString()} total capacity</div>
            </div>
            <div class="org-stat-card org-stat-card--amber">
                <div class="org-stat-card__icon">👁️</div>
                <div class="org-stat-card__value">${s.totalViews.toLocaleString()}</div>
                <div class="org-stat-card__label">Event Views</div>
                <div class="org-stat-card__sub">Across all events</div>
            </div>
        </div>

        <div class="dash-overview__grid">
            <div class="dash-card fade-in">
                <div class="dash-card__header">
                    <h3>Your Events</h3>
                    <a href="create-event.html" class="dash-card__link">+ Create New</a>
                </div>
                <div class="dash-card__body">
                    ${orgState.events.length > 0 ? orgState.events.slice(0, 5).map(e => {
                        const pct = Math.round((e.registered_count || 0) / (e.capacity || 1) * 100);
                        const catColor = (categoryColors || {})[e.category] || '#6B7280';
                        const isLive = new Date(e.date) >= new Date();
                        return `
                        <div class="org-event-item" onclick="orgSelectEvent(${e.id},'analytics')">
                            <div class="org-event-item__left">
                                <span class="org-event-item__status ${isLive ? 'org-event-item__status--live' : 'org-event-item__status--ended'}">${isLive ? 'Live' : 'Ended'}</span>
                                <div class="org-event-item__info">
                                    <h4>${e.title}</h4>
                                    <p>${e.date} • ${e.registered_count}/${e.capacity} registered (${pct}%)</p>
                                </div>
                            </div>
                            <span class="org-event-item__cat" style="color:${catColor}">${e.category}</span>
                        </div>`;
                    }).join('') : `<div class="dash-card__empty"><p>No events created yet</p><a href="create-event.html" class="btn btn-sm btn-primary">Create Your First Event</a></div>`}
                </div>
            </div>

            <div class="dash-card fade-in">
                <div class="dash-card__header"><h3>Category Breakdown</h3></div>
                <div class="dash-card__body">
                    ${Object.keys(data.categoryBreakdown || {}).length > 0 ? Object.entries(data.categoryBreakdown).map(([cat, count]) => {
                        const catColor = (categoryColors || {})[cat] || '#6B7280';
                        const pct = Math.round((count / s.totalEvents) * 100);
                        return `<div class="org-category-bar">
                            <div class="org-category-bar__label"><span style="color:${catColor}">${cat}</span><span>${count} events</span></div>
                            <div class="org-category-bar__track"><div class="org-category-bar__fill" style="width:${pct}%;background:${catColor}"></div></div>
                        </div>`;
                    }).join('') : '<p style="color:var(--text-tertiary);text-align:center;">No data yet</p>'}
                </div>
            </div>
        </div>
    </div>`;
    setTimeout(initScrollAnimations, 50);
}

function getOrgGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

// ===== MY EVENTS =====
async function renderOrgEvents(el) {
    const data = await API.getOrganiserStats();
    orgState.events = data.events || [];

    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header">
            <h2>My Events</h2>
            <a href="create-event.html" class="btn btn-sm btn-primary">+ Create New Event</a>
        </div>
        ${orgState.events.length === 0 ? `<div class="dash-empty"><h3>No events yet</h3><p>Create your first event and start collecting registrations!</p><a href="create-event.html" class="btn btn-primary">Create Event</a></div>` : `
        <div class="org-events-list">
            ${orgState.events.map(e => {
                const pct = Math.round((e.registered_count || 0) / (e.capacity || 1) * 100);
                const catColor = (categoryColors || {})[e.category] || '#6B7280';
                const isLive = new Date(e.date) >= new Date();
                return `
                <div class="org-event-card">
                    <div class="org-event-card__header">
                        <div>
                            <span class="org-event-item__status ${isLive ? 'org-event-item__status--live' : 'org-event-item__status--ended'}">${isLive ? '● Live' : '● Ended'}</span>
                            <h3>${e.title}</h3>
                            <div class="org-event-card__meta">
                                <span>📅 ${formatDate(e.date)}</span>
                                <span class="org-event-card__cat" style="background:${catColor}15;color:${catColor}">${e.category}</span>
                            </div>
                        </div>
                    </div>
                    <div class="org-event-card__stats">
                        <div class="org-event-card__stat">
                            <span class="org-event-card__stat-value">${e.registered_count || 0}</span>
                            <span class="org-event-card__stat-label">Registered</span>
                        </div>
                        <div class="org-event-card__stat">
                            <span class="org-event-card__stat-value">${e.capacity}</span>
                            <span class="org-event-card__stat-label">Capacity</span>
                        </div>
                        <div class="org-event-card__stat">
                            <span class="org-event-card__stat-value ${pct > 80 ? 'text-red' : ''}">${pct}%</span>
                            <span class="org-event-card__stat-label">Fill Rate</span>
                        </div>
                    </div>
                    <div class="org-event-card__progress">
                        <div class="org-event-card__progress-bar" style="width:${pct}%;background:${pct > 80 ? 'var(--red)' : catColor}"></div>
                    </div>
                    <div class="org-event-card__actions">
                        <button class="btn btn-sm btn-secondary" onclick="orgSelectEvent(${e.id},'analytics')">📈 Analytics</button>
                        <button class="btn btn-sm btn-secondary" onclick="orgSelectEvent(${e.id},'attendees')">👥 Attendees</button>
                        <button class="btn btn-sm btn-secondary" onclick="orgSelectEvent(${e.id},'marketing')">📣 Share</button>
                        <a href="event-details.html?id=${e.id}" class="btn btn-sm btn-secondary">View Page</a>
                    </div>
                </div>`;
            }).join('')}
        </div>`}
    </div>`;
}

function orgSelectEvent(eventId, tab) {
    orgState.selectedEventId = eventId;
    orgSwitchTab(tab);
}

// ===== ANALYTICS =====
async function renderOrgAnalytics(el) {
    if (!orgState.selectedEventId && orgState.events.length > 0) {
        orgState.selectedEventId = orgState.events[0].id;
    }
    if (!orgState.selectedEventId) {
        el.innerHTML = `<div class="dash-empty"><h3>No events to analyze</h3><p>Create an event first to see analytics.</p><a href="create-event.html" class="btn btn-primary">Create Event</a></div>`;
        return;
    }

    // Load events if not loaded
    if (orgState.events.length === 0) {
        const statsData = await API.getOrganiserStats();
        orgState.events = statsData.events || [];
    }

    const data = await API.getEventAnalytics(orgState.selectedEventId);
    const ev = data.event;
    const a = data.analytics;
    const catColor = (categoryColors || {})[ev.category] || '#6B7280';

    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header">
            <div>
                <h2>Event Analytics</h2>
                <p class="dash-section__subtitle">${ev.title}</p>
            </div>
            <select class="org-event-select" onchange="orgState.selectedEventId=parseInt(this.value);orgSwitchTab('analytics')">
                ${orgState.events.map(e => `<option value="${e.id}" ${e.id === orgState.selectedEventId ? 'selected' : ''}>${e.title}</option>`).join('')}
            </select>
        </div>

        <div class="org-analytics-grid">
            <div class="org-analytics-card">
                <div class="org-analytics-card__icon" style="background:${catColor}15;color:${catColor}">📊</div>
                <div class="org-analytics-card__value">${a.fillRate}%</div>
                <div class="org-analytics-card__label">Fill Rate</div>
            </div>
            <div class="org-analytics-card">
                <div class="org-analytics-card__icon" style="background:#3B82F615;color:#3B82F6">👁️</div>
                <div class="org-analytics-card__value">${a.views}</div>
                <div class="org-analytics-card__label">Page Views</div>
            </div>
            <div class="org-analytics-card">
                <div class="org-analytics-card__icon" style="background:#22C55E15;color:#22C55E">📈</div>
                <div class="org-analytics-card__value">${a.avgRegsPerDay}</div>
                <div class="org-analytics-card__label">Avg Regs/Day</div>
            </div>
            <div class="org-analytics-card">
                <div class="org-analytics-card__icon" style="background:#F59E0B15;color:#F59E0B">⏰</div>
                <div class="org-analytics-card__value">${a.daysUntilEvent > 0 ? a.daysUntilEvent + 'd' : 'Past'}</div>
                <div class="org-analytics-card__label">${a.daysUntilEvent > 0 ? 'Days Until Event' : 'Event Ended'}</div>
            </div>
        </div>

        <!-- Fill Rate Gauge -->
        <div class="dash-card fade-in" style="margin-top:1.5rem;">
            <div class="dash-card__header"><h3>Capacity Utilization</h3></div>
            <div class="dash-card__body" style="text-align:center;">
                <div class="org-gauge">
                    <svg viewBox="0 0 200 120" class="org-gauge__svg">
                        <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="#e2e4ea" stroke-width="16" fill="none" stroke-linecap="round"/>
                        <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="${a.fillRate > 80 ? 'var(--red)' : catColor}" stroke-width="16" fill="none" stroke-linecap="round"
                            stroke-dasharray="${a.fillRate * 2.51} 251" style="transition:stroke-dasharray 1s ease;"/>
                    </svg>
                    <div class="org-gauge__value">${ev.registered_count}/${ev.capacity}</div>
                    <div class="org-gauge__label">${a.fillRate}% filled</div>
                </div>
            </div>
        </div>

        <!-- Registration Timeline -->
        ${a.registrationTimeline && a.registrationTimeline.length > 0 ? `
        <div class="dash-card fade-in" style="margin-top:1rem;">
            <div class="dash-card__header"><h3>Registration Timeline</h3></div>
            <div class="dash-card__body">
                <div class="org-timeline">
                    ${a.registrationTimeline.map((t, i) => {
                        const maxCount = Math.max(...a.registrationTimeline.map(x => x.count));
                        const barPct = maxCount > 0 ? Math.round((t.count / maxCount) * 100) : 0;
                        return `<div class="org-timeline__bar" title="${t.date}: ${t.count} registrations (Total: ${t.cumulative})">
                            <div class="org-timeline__bar-fill" style="height:${Math.max(barPct, 5)}%;background:${catColor}"></div>
                            <span class="org-timeline__bar-label">${t.date.split('-').slice(1).join('/')}</span>
                            <span class="org-timeline__bar-value">${t.count}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>` : ''}
    </div>`;
    setTimeout(initScrollAnimations, 50);
}

// ===== ATTENDEES =====
async function renderOrgAttendees(el) {
    if (!orgState.selectedEventId && orgState.events.length > 0) {
        orgState.selectedEventId = orgState.events[0].id;
    }
    if (orgState.events.length === 0) {
        const statsData = await API.getOrganiserStats();
        orgState.events = statsData.events || [];
        if (orgState.events.length > 0 && !orgState.selectedEventId) {
            orgState.selectedEventId = orgState.events[0].id;
        }
    }
    if (!orgState.selectedEventId) {
        el.innerHTML = `<div class="dash-empty"><h3>No events yet</h3><p>Create an event to manage attendees.</p></div>`;
        return;
    }

    const data = await API.getEventAttendees(orgState.selectedEventId);
    const attendees = data.attendees || [];
    const stats = data.stats;

    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header">
            <div>
                <h2>Attendee Management</h2>
                <p class="dash-section__subtitle">${data.event?.title || 'Event'} — ${stats.total} registered</p>
            </div>
            <div style="display:flex;gap:0.5rem;align-items:center;">
                <select class="org-event-select" onchange="orgState.selectedEventId=parseInt(this.value);orgSwitchTab('attendees')">
                    ${orgState.events.map(e => `<option value="${e.id}" ${e.id === orgState.selectedEventId ? 'selected' : ''}>${e.title}</option>`).join('')}
                </select>
                <button class="btn btn-sm btn-primary" onclick="exportCSV(${orgState.selectedEventId})">📥 Export CSV</button>
            </div>
        </div>

        <!-- Attendee breakdown cards -->
        <div class="org-attendee-summary">
            <div class="org-attendee-summary__card">
                <span class="org-attendee-summary__value">${stats.total}</span>
                <span class="org-attendee-summary__label">Total</span>
            </div>
            <div class="org-attendee-summary__card org-attendee-summary__card--cu">
                <span class="org-attendee-summary__value">${stats.cuStudents}</span>
                <span class="org-attendee-summary__label">CU Students</span>
            </div>
            <div class="org-attendee-summary__card org-attendee-summary__card--ext">
                <span class="org-attendee-summary__value">${stats.external}</span>
                <span class="org-attendee-summary__label">External</span>
            </div>
        </div>

        ${attendees.length > 0 ? `
        <!-- Search -->
        <div class="org-attendee-search">
            <input type="text" id="attendeeSearch" placeholder="Search by name, email, college..." oninput="filterAttendeeTable(this.value)">
        </div>

        <!-- Attendee Table -->
        <div class="org-table-wrapper">
            <table class="org-table" id="attendeeTable">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Department</th>
                        <th>Type</th>
                        <th>Registered</th>
                    </tr>
                </thead>
                <tbody>
                    ${attendees.map((a, i) => `
                    <tr class="attendee-row">
                        <td>${i + 1}</td>
                        <td><strong>${a.name}</strong></td>
                        <td>${a.email}</td>
                        <td>${a.college || '—'}</td>
                        <td>${a.department || '—'}</td>
                        <td><span class="org-type-badge ${a.isExternal ? 'org-type-badge--ext' : 'org-type-badge--cu'}">${a.isExternal ? 'External' : 'CU'}</span></td>
                        <td>${a.registeredAt ? new Date(a.registeredAt).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'}) : '—'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>

        <!-- Department & College Breakdown -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1.5rem;">
            <div class="dash-card">
                <div class="dash-card__header"><h3>By Department</h3></div>
                <div class="dash-card__body">
                    ${Object.entries(stats.departmentBreakdown || {}).sort((a, b) => b[1] - a[1]).map(([dept, count]) => `
                    <div class="org-breakdown-row">
                        <span>${dept}</span><span class="org-breakdown-count">${count}</span>
                    </div>`).join('') || '<p style="color:var(--text-tertiary);">No data</p>'}
                </div>
            </div>
            <div class="dash-card">
                <div class="dash-card__header"><h3>By College</h3></div>
                <div class="dash-card__body">
                    ${Object.entries(stats.collegeBreakdown || {}).sort((a, b) => b[1] - a[1]).map(([col, count]) => `
                    <div class="org-breakdown-row">
                        <span>${col}</span><span class="org-breakdown-count">${count}</span>
                    </div>`).join('') || '<p style="color:var(--text-tertiary);">No data</p>'}
                </div>
            </div>
        </div>
        ` : `<div class="dash-empty"><h3>No registrations yet</h3><p>Share your event to get people registered!</p></div>`}
    </div>`;
}

function filterAttendeeTable(query) {
    const rows = document.querySelectorAll('.attendee-row');
    const q = query.toLowerCase();
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function exportCSV(eventId) {
    const token = API.getToken();
    window.open(`/api/organiser/events/${eventId}/export`, '_blank');
}

// ===== PR & MARKETING =====
async function renderOrgMarketing(el) {
    if (!orgState.selectedEventId && orgState.events.length > 0) {
        orgState.selectedEventId = orgState.events[0].id;
    }
    if (orgState.events.length === 0) {
        const statsData = await API.getOrganiserStats();
        orgState.events = statsData.events || [];
        if (orgState.events.length > 0 && !orgState.selectedEventId) orgState.selectedEventId = orgState.events[0].id;
    }
    if (!orgState.selectedEventId) {
        el.innerHTML = `<div class="dash-empty"><h3>No events to promote</h3><p>Create an event first.</p></div>`;
        return;
    }

    const selectedEvent = orgState.events.find(e => e.id === orgState.selectedEventId);
    const eventUrl = `${window.location.origin}/event-details.html?id=${orgState.selectedEventId}`;

    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header">
            <div>
                <h2>PR & Marketing Tools</h2>
                <p class="dash-section__subtitle">${selectedEvent?.title || 'Select an event'}</p>
            </div>
            <select class="org-event-select" onchange="orgState.selectedEventId=parseInt(this.value);orgSwitchTab('marketing')">
                ${orgState.events.map(e => `<option value="${e.id}" ${e.id === orgState.selectedEventId ? 'selected' : ''}>${e.title}</option>`).join('')}
            </select>
        </div>

        <!-- Share Links -->
        <div class="dash-card fade-in">
            <div class="dash-card__header"><h3>📤 Share Event</h3></div>
            <div class="dash-card__body">
                <div class="org-share-url">
                    <input type="text" value="${eventUrl}" readonly id="shareUrl">
                    <button class="btn btn-sm btn-primary" onclick="copyShareUrl()">📋 Copy</button>
                </div>
                <div class="org-share-buttons">
                    <a href="https://wa.me/?text=${encodeURIComponent('Check out this event: ' + (selectedEvent?.title || '') + ' ' + eventUrl)}" target="_blank" class="org-share-btn org-share-btn--whatsapp">💬 WhatsApp</a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out: ' + (selectedEvent?.title || ''))}&url=${encodeURIComponent(eventUrl)}" target="_blank" class="org-share-btn org-share-btn--twitter">🐦 Twitter</a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}" target="_blank" class="org-share-btn org-share-btn--linkedin">💼 LinkedIn</a>
                    <a href="mailto:?subject=${encodeURIComponent(selectedEvent?.title || 'Check out this event')}&body=${encodeURIComponent('Hey! Check out this event: ' + eventUrl)}" class="org-share-btn org-share-btn--email">📧 Email</a>
                </div>
            </div>
        </div>

        <!-- Notify Attendees -->
        <div class="dash-card fade-in" style="margin-top:1rem;">
            <div class="dash-card__header">
                <h3>📢 Notify All Attendees</h3>
                <span style="font-size:0.8rem;color:var(--text-tertiary);">${selectedEvent?.registered_count || 0} will receive</span>
            </div>
            <div class="dash-card__body">
                <div class="form-group">
                    <textarea id="notifyMessage" rows="3" placeholder="Type your announcement or update here..." style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:0.8rem;font-family:inherit;font-size:0.9rem;resize:vertical;"></textarea>
                </div>
                <button class="btn btn-primary" onclick="sendNotification(${orgState.selectedEventId})">Send Notification to All Attendees</button>
            </div>
        </div>

        <!-- QR Code -->
        <div class="dash-card fade-in" style="margin-top:1rem;">
            <div class="dash-card__header"><h3>📱 QR Code</h3></div>
            <div class="dash-card__body" style="text-align:center;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(eventUrl)}" alt="Event QR Code" style="border-radius:12px;border:2px solid var(--border);">
                <p style="font-size:0.82rem;color:var(--text-secondary);margin-top:0.8rem;">Scan to open event registration page</p>
                <a href="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(eventUrl)}" download class="btn btn-sm btn-secondary" style="margin-top:0.5rem;">Download HD QR</a>
            </div>
        </div>
    </div>`;
    setTimeout(initScrollAnimations, 50);
}

function copyShareUrl() {
    const input = document.getElementById('shareUrl');
    if (input) {
        navigator.clipboard?.writeText(input.value);
        showToast('Event URL copied!', 'success');
    }
}

async function sendNotification(eventId) {
    const msg = document.getElementById('notifyMessage')?.value.trim();
    if (!msg) { showToast('Please enter a message', 'error'); return; }
    try {
        const data = await API.notifyAttendees(eventId, msg);
        showToast(data.message || 'Notification sent!', 'success');
        document.getElementById('notifyMessage').value = '';
    } catch (err) {
        showToast(err.error || 'Failed to send notification', 'error');
    }
}

// ===== SETTINGS =====
function renderOrgSettings(el) {
    const u = AppState.currentUser;
    el.innerHTML = `
    <div class="dash-section">
        <div class="dash-section__header"><h2>Account & Organization Settings</h2></div>
        <div class="dash-settings">
            <div class="dash-settings__card">
                <div class="dash-settings__card-header">
                    <h3>Organization Profile</h3>
                    <p>Your organiser information</p>
                </div>
                <div class="dash-settings__card-body">
                    <div class="dash-settings__form-row">
                        <div class="form-group"><label>Full Name</label><input type="text" value="${u.name || ''}" id="orgSetName"></div>
                        <div class="form-group"><label>Organization Name</label><input type="text" value="${u.organization_name || ''}" id="orgSetOrgName"></div>
                    </div>
                    <div class="dash-settings__form-row">
                        <div class="form-group"><label>Email <span class="dash-settings__locked">Locked</span></label><input type="email" value="${u.email || ''}" disabled></div>
                        <div class="form-group"><label>Phone</label><input type="tel" value="${u.phone || ''}" id="orgSetPhone"></div>
                    </div>
                    <div class="dash-settings__form-row">
                        <div class="form-group"><label>Organization Type</label>
                            <select id="orgSetType">
                                <option value="">Select</option>
                                <option value="university_club" ${u.organization_type === 'university_club' ? 'selected' : ''}>University Club</option>
                                <option value="department" ${u.organization_type === 'department' ? 'selected' : ''}>Department</option>
                                <option value="external_org" ${u.organization_type === 'external_org' ? 'selected' : ''}>External Organization</option>
                                <option value="individual" ${u.organization_type === 'individual' ? 'selected' : ''}>Individual Organiser</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Department</label><input type="text" value="${u.department || ''}" id="orgSetDept"></div>
                    </div>
                    <button class="btn btn-primary" onclick="saveOrgSettings()">Save Changes</button>
                </div>
            </div>

            <div class="dash-settings__card">
                <div class="dash-settings__card-header"><h3>Security</h3><p>Change your password</p></div>
                <div class="dash-settings__card-body">
                    <div class="dash-settings__form-row">
                        <div class="form-group"><label>Current Password</label><input type="password" id="orgCurPass" placeholder="Enter current password"></div>
                        <div class="form-group"><label>New Password</label><input type="password" id="orgNewPass" placeholder="Min 6 characters"></div>
                    </div>
                    <button class="btn btn-secondary" onclick="orgChangePassword()">Change Password</button>
                </div>
            </div>

            <div class="dash-settings__card dash-settings__card--danger">
                <div class="dash-settings__card-header"><h3>Session</h3></div>
                <div class="dash-settings__card-body">
                    <button class="btn btn-danger-outline" onclick="logout()">Logout from this device</button>
                </div>
            </div>
        </div>
    </div>`;
}

async function saveOrgSettings() {
    try {
        const data = await API.updateProfile({
            name: document.getElementById('orgSetName').value,
            phone: document.getElementById('orgSetPhone').value,
            department: document.getElementById('orgSetDept').value,
            organizationName: document.getElementById('orgSetOrgName').value,
            organizationType: document.getElementById('orgSetType').value
        });
        AppState.currentUser = data.user;
        updateOrgProfile();
        updateAuthUI();
        showToast('Settings saved!', 'success');
    } catch (err) {
        showToast(err.error || 'Failed to save', 'error');
    }
}

async function orgChangePassword() {
    const curPass = document.getElementById('orgCurPass').value;
    const newPass = document.getElementById('orgNewPass').value;
    if (!curPass || !newPass) { showToast('Please fill both fields', 'error'); return; }
    try {
        await API.changePassword({ currentPassword: curPass, newPassword: newPass });
        showToast('Password changed!', 'success');
        document.getElementById('orgCurPass').value = '';
        document.getElementById('orgNewPass').value = '';
    } catch (err) {
        showToast(err.error || 'Failed to change password', 'error');
    }
}
