// ============================================
// CU EVENT MANAGEMENT - CORE APP LOGIC
// (API-BACKED VERSION)
// ============================================

// ===== STATE MANAGEMENT =====
let _resolveAppReady;
const AppState = {
  ready: new Promise(resolve => { _resolveAppReady = resolve; }),
  currentUser: null,
  registrations: [],
  favorites: [],
  createdEvents: [],
  notifications: [],

  async init() {
    // Restore user from API if token exists
    if (API.isLoggedIn()) {
      try {
        const data = await API.getProfile();
        this.currentUser = data.user;
      } catch (e) {
        console.warn('Session expired or invalid, clearing token');
        this.currentUser = null;
        API.setToken(null);
        // Show re-login prompt after page loads
        setTimeout(() => {
          if (typeof showToast === 'function') showToast('Session expired. Please login again.', 'warning');
          if (typeof openAuthModal === 'function') setTimeout(() => openAuthModal('login'), 800);
        }, 500);
      }
    }
  },

  isLoggedIn() { return !!this.currentUser; },

  async toggleFavorite(eventId) {
    const data = await API.toggleFavorite(eventId);
    return data.isFavorite;
  },

  isFavorite(eventId) { return this.favorites.includes(eventId); },
  isRegistered(eventId) { return this.registrations.some(r => r.eventId === eventId || r.event_id === eventId); },

  async loadUserData() {
    if (!this.isLoggedIn()) return;
    try {
      const [regs, favs, notifs] = await Promise.all([
        API.getRegistrations().catch(() => ({ registrations: [] })),
        API.getFavorites().catch(() => ({ favorites: [] })),
        API.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 }))
      ]);
      this.registrations = regs.registrations || [];
      this.favorites = (favs.favorites || []).map(f => f.id);
      this.notifications = notifs.notifications || [];
      this._unreadCount = notifs.unreadCount || 0;
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
  },

  addNotification(message, type = 'info') {
    this.notifications.unshift({ id: Date.now(), message, type, created_at: new Date().toISOString(), read: 0 });
  },

  getUnreadCount() { return this._unreadCount || this.notifications.filter(n => !n.read).length; }
};

function getEventById(id) {
  // This is used by pages that already have events loaded
  if (typeof cuEvents !== 'undefined') {
    return [...cuEvents, ...AppState.createdEvents].find(e => e.id === parseInt(id));
  }
  return null;
}

function getAllEvents() {
  const staticEvents = typeof cuEvents !== 'undefined' ? cuEvents : [];
  const apiEvents = AppState._apiEvents || [];
  // Merge: API events override static ones with same ID
  const map = new Map();
  staticEvents.forEach(e => map.set(e.id, e));
  apiEvents.forEach(e => map.set(e.id, e));
  return Array.from(map.values());
}

// Fetch events from API and cache them
async function loadApiEvents() {
  try {
    const data = await API.getEvents({ limit: 100 });
    AppState._apiEvents = data.events || [];
  } catch (e) {
    console.warn('Could not load API events:', e);
    AppState._apiEvents = [];
  }
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-overlay');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      mobileMenu?.classList.add('open');
      overlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  const closeBtn = document.querySelector('.mobile-menu .close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeMobile);
  overlay?.addEventListener('click', closeMobile);
  function closeMobile() {
    mobileMenu?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });
  updateNotifBadge();
  updateAuthUI();
}

function updateNotifBadge() {
  const badge = document.querySelector('.nav-notif .badge');
  if (badge) {
    const count = AppState.getUnreadCount();
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  // Also refresh dropdown content if it exists
  const body = document.querySelector('.notif-dropdown__body');
  if (body) renderNotifDropdownItems(body);
}

function updateAuthUI() {
  const authBtns = document.querySelectorAll('.auth-btn');
  const profileBtns = document.querySelectorAll('.profile-btn');
  if (AppState.isLoggedIn()) {
    authBtns.forEach(b => b.style.display = 'none');
    profileBtns.forEach(b => { b.style.display = 'flex'; b.textContent = AppState.currentUser.name?.charAt(0) || 'U'; });
  } else {
    authBtns.forEach(b => b.style.display = '');
    profileBtns.forEach(b => b.style.display = 'none');
  }
}

// ===== AUTH MODAL =====
let _authSelectedRole = 'attendee';

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  showAuthForm(mode);
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function showAuthForm(mode) {
  document.getElementById('loginForm')?.classList.toggle('active', mode === 'login');
  document.getElementById('signupRoleSelect')?.classList.toggle('active', mode === 'signup-role');
  document.getElementById('signupForm')?.classList.toggle('active', mode === 'signup');
  if (mode === 'login') {
    document.getElementById('signupRoleSelect')?.classList.remove('active');
    document.getElementById('signupForm')?.classList.remove('active');
  }
  if (mode === 'signup-role') {
    document.getElementById('loginForm')?.classList.remove('active');
    document.getElementById('signupForm')?.classList.remove('active');
  }
  if (mode === 'signup') {
    document.getElementById('loginForm')?.classList.remove('active');
    document.getElementById('signupRoleSelect')?.classList.remove('active');
    updateSignupFormForRole();
  }
}

function selectRole(role) {
  _authSelectedRole = role;
  showAuthForm('signup');
}

function updateSignupFormForRole() {
  const orgFields = document.getElementById('orgFields');
  const cuIdField = document.getElementById('signupCuIdGroup');
  const collegeField = document.getElementById('signupCollegeGroup');
  if (_authSelectedRole === 'organiser') {
    if (orgFields) orgFields.style.display = 'block';
    if (cuIdField) cuIdField.querySelector('label').innerHTML = 'CU ID <span style="color:var(--text-tertiary);font-weight:400">(optional)</span>';
  } else {
    if (orgFields) orgFields.style.display = 'none';
    if (cuIdField) cuIdField.querySelector('label').innerHTML = 'CU ID <span style="color:var(--text-tertiary);font-weight:400">(optional, for CU students)</span>';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const identifier = fd.get('identifier');
  const password = fd.get('password');
  if (!identifier || !password) { showToast('Please fill all fields', 'error'); return; }
  try {
    const data = await API.login(identifier, password);
    AppState.currentUser = data.user;
    await AppState.loadUserData();
    showToast('Welcome back, ' + data.user.name + '!', 'success');
    closeAuthModal();
    updateAuthUI();
    updateNotifBadge();
    // Redirect organiser to organiser dashboard if on attendee dashboard
    if (data.user.role === 'organiser' && window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'organiser-dashboard.html';
    }
  } catch (err) {
    showToast(err.error || 'Login failed', 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const user = {
    name: fd.get('name'),
    email: fd.get('email'),
    password: fd.get('password'),
    phone: fd.get('phone') || null,
    department: fd.get('department') || null,
    year: fd.get('year') || null,
    cuId: fd.get('cuId') || null,
    college: fd.get('college') || 'Chandigarh University',
    role: _authSelectedRole,
    organizationName: fd.get('organizationName') || null,
    organizationType: fd.get('organizationType') || null
  };
  if (!user.name || !user.email || !user.password) { showToast('Please fill all required fields', 'error'); return; }
  if (fd.get('password') !== fd.get('confirmPassword')) { showToast('Passwords do not match', 'error'); return; }
  if (_authSelectedRole === 'organiser' && !user.organizationName) { showToast('Organization name is required for organisers', 'error'); return; }
  try {
    const data = await API.signup(user);
    AppState.currentUser = data.user;
    await AppState.loadUserData();
    showToast('Account created successfully!', 'success');
    closeAuthModal();
    updateAuthUI();
    updateNotifBadge();
    if (data.user.role === 'organiser') {
      showToast('Welcome to the Organiser Panel!', 'info');
    }
  } catch (err) {
    showToast(err.error || 'Signup failed', 'error');
  }
}

function logout() {
  API.logout();
  AppState.currentUser = null;
  AppState.registrations = [];
  AppState.favorites = [];
  AppState.notifications = [];
  updateAuthUI();
  showToast('Logged out successfully', 'info');
  if (window.location.pathname.includes('dashboard')) {
    window.location.href = 'index.html';
  }
}

// ===== TOAST NOTIFICATIONS =====
const TOAST_ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <div class="toast__icon">${TOAST_ICONS[type] || 'ℹ'}</div>
    <div class="toast__body">
      <div class="toast__title">${type}</div>
      <div class="toast__message">${message}</div>
    </div>
    <button class="toast__close" onclick="dismissToast(this.parentElement)">&times;</button>
    <div class="toast__progress"><div class="toast__progress-bar"></div></div>
  `;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  // Auto-dismiss
  let timeout = setTimeout(() => dismissToast(toast), 4200);

  // Pause on hover
  toast.addEventListener('mouseenter', () => clearTimeout(timeout));
  toast.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => dismissToast(toast), 2000);
  });
}

function dismissToast(el) {
  if (!el || el._dismissed) return;
  el._dismissed = true;
  el.classList.remove('toast--visible');
  el.classList.add('toast--exiting');
  setTimeout(() => el.remove(), 400);
}

// ===== OTP TOAST — PROFESSIONAL =====
function showOtpToast(otp, email) {
  // Remove any existing OTP toast
  document.querySelector('.otp-toast')?.remove();

  const el = document.createElement('div');
  el.className = 'otp-toast';
  el.innerHTML = `
    <div class="otp-toast__header">
      <div class="otp-toast__icon">🔐</div>
      <div>
        <div class="otp-toast__title">Verification Code</div>
        <div class="otp-toast__subtitle">Sent to ${email}</div>
      </div>
      <button class="otp-toast__close" onclick="this.closest('.otp-toast').remove()">&times;</button>
    </div>
    <div class="otp-toast__code" id="otpCodeDisplay">${String(otp).split('').map(d => `<span>${d}</span>`).join('')}</div>
    <div class="otp-toast__actions">
      <button class="otp-toast__copy" onclick="copyOtp('${otp}')">
        📋 Copy Code
      </button>
      <span class="otp-toast__timer" id="otpTimer">Expires in 30s</span>
    </div>
    <div class="otp-toast__progress"><div class="otp-toast__progress-bar"></div></div>
  `;
  document.body.appendChild(el);

  // Animate in
  requestAnimationFrame(() => el.classList.add('otp-toast--visible'));

  // 30-second countdown
  let remaining = 30;
  const timerEl = el.querySelector('#otpTimer');
  const interval = setInterval(() => {
    remaining--;
    if (timerEl) timerEl.textContent = `Expires in ${remaining}s`;
    if (remaining <= 0) {
      clearInterval(interval);
      el.classList.remove('otp-toast--visible');
      setTimeout(() => el.remove(), 400);
    }
  }, 1000);
}

function copyOtp(otp) {
  navigator.clipboard?.writeText(otp);
  const btn = document.querySelector('.otp-toast__copy');
  if (btn) {
    btn.innerHTML = '✅ Copied!';
    setTimeout(() => { btn.innerHTML = '📋 Copy Code'; }, 2000);
  }
}

// ===== NOTIFICATION HELPERS =====
function getNotifIcon(message) {
  const m = (message || '').toLowerCase();
  if (m.includes('register') || m.includes('registration') || m.includes('confirmed')) return { icon: '🎫', cls: 'registration' };
  if (m.includes('event') || m.includes('published') || m.includes('created')) return { icon: '🎉', cls: 'event' };
  if (m.includes('cancel') || m.includes('alert') || m.includes('warning')) return { icon: '⚠️', cls: 'alert' };
  return { icon: '🔔', cls: 'system' };
}

function relativeTime(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const secs = Math.floor((now - d) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function getNotifDateGroup(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return 'This Week';
  return 'Earlier';
}

// ===== NOTIFICATION DROPDOWN =====
function toggleNotifDropdown(e) {
  e?.stopPropagation();
  const dd = document.querySelector('.notif-dropdown');
  const overlay = document.querySelector('.notif-overlay');
  if (!dd) return;

  const isOpen = dd.classList.contains('open');
  if (isOpen) {
    dd.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  } else {
    // Refresh content
    const body = dd.querySelector('.notif-dropdown__body');
    if (body) renderNotifDropdownItems(body);
    dd.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }
}

function closeNotifDropdown() {
  const dd = document.querySelector('.notif-dropdown');
  const overlay = document.querySelector('.notif-overlay');
  if (dd) dd.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

function renderNotifDropdownItems(body) {
  const notifs = (AppState.notifications || []).slice(0, 15);
  if (notifs.length === 0) {
    body.innerHTML = '<div class="notif-empty"><div class="notif-empty__icon">🔔</div><div class="notif-empty__text">No notifications yet</div></div>';
    return;
  }

  // Group by date
  const groups = {};
  notifs.forEach(n => {
    const group = getNotifDateGroup(n.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  });

  let html = '';
  for (const [label, items] of Object.entries(groups)) {
    html += `<div class="notif-group-label">${label}</div>`;
    items.forEach(n => {
      const { icon, cls } = getNotifIcon(n.message);
      const unread = !n.read ? 'unread' : '';
      html += `<div class="notif-item ${unread}">
        <div class="notif-item__icon notif-item__icon--${cls}"><i data-lucide="${icon}"></i></div>
        <div class="notif-item__body">
          <div class="notif-item__message">${n.message}</div>
          <div class="notif-item__time">${relativeTime(n.created_at)}</div>
        </div>
        <button class="notif-item__delete" onclick="event.stopPropagation();deleteNotifFromDropdown(${n.id})" title="Remove">✕</button>
      </div>`;
    });
  }
  body.innerHTML = html;
}

async function markAllReadFromDropdown() {
  try {
    await API.markAllRead();
    AppState._unreadCount = 0;
    AppState.notifications.forEach(n => n.read = 1);
    updateNotifBadge();
    showToast('All notifications marked as read', 'success');
  } catch (err) {
    showToast(err.error || 'Failed', 'error');
  }
}

async function deleteNotifFromDropdown(id) {
  try {
    await API.deleteNotification(id);
    AppState.notifications = AppState.notifications.filter(n => n.id !== id);
    const wasUnread = AppState._unreadCount > 0;
    if (wasUnread) AppState._unreadCount = Math.max(0, AppState._unreadCount - 1);
    updateNotifBadge();
  } catch (err) {
    showToast('Failed to delete', 'error');
  }
}

// ===== EVENT CARD RENDERING =====
// Category image mapping
const categoryImages = {
  'Technical': 'images/categories/technical.png',
  'Cultural': 'images/categories/cultural.png',
  'Sports': 'images/categories/sports.png',
  'Entertainment': 'images/categories/entertainment.png',
  'Academic': 'images/categories/academic.png',
  'Career': 'images/categories/career.png',
  'Social': 'images/categories/social.png',
  'Competition': 'images/categories/competition.png'
};

function renderEventCard(event) {
  const pct = Math.round((event.registered_count || event.registered || 0) / (event.capacity || 1) * 100);
  const isFav = AppState.isFavorite(event.id);
  const isReg = AppState.isRegistered(event.id);
  const catColor = categoryColors[event.category] || '#6B7280';
  const catImage = categoryImages[event.category] || '';
  const dateObj = new Date(event.date + 'T' + (event.start_time || event.startTime || '09:00'));
  const dateStr = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return `
    <div class="event-card fade-in" data-id="${event.id}">
      <div class="event-card-image">
        <div class="card-img" style="background: url('${catImage}') center/cover no-repeat, linear-gradient(135deg, ${catColor}44, ${catColor}22);">
          <div class="card-img-overlay"></div>
        </div>
        <span class="category-badge" style="background:${catColor}">${event.category}</span>
        ${event.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
        <button class="bookmark-btn ${isFav ? 'bookmarked' : ''}" onclick="toggleFav(${event.id}, this)" title="Save to favorites">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="event-card-content">
        <div class="event-card-organizer"><span class="org-icon">${event.organizer_logo || event.organizerLogo || '📋'}</span> ${event.organizer}</div>
        <h3><a href="event-details.html?id=${event.id}">${event.title}</a></h3>
        <div class="event-card-meta">
          <span>📅 ${dateStr} • ${timeStr}</span>
          <span>📍 ${event.venue}</span>
        </div>
        <div class="seats-bar"><div class="seats-bar-fill ${pct > 80 ? 'almost-full' : ''}" style="width:${pct}%"></div></div>
        <div class="event-card-footer">
          <div class="event-card-stats">
            <span class="attendance">${event.registered_count || event.registered || 0}/${event.capacity} registered</span>
            <span class="price">${event.price}</span>
          </div>
          <div class="event-card-actions">
            <a href="event-details.html?id=${event.id}" class="btn btn-sm btn-secondary">View</a>
            <button class="btn btn-sm btn-primary" onclick="quickRegister(${event.id})" ${isReg ? 'disabled style="opacity:0.6"' : ''}>
              ${isReg ? '✓ Registered' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

async function toggleFav(eventId, btn) {
  if (!AppState.isLoggedIn()) { openAuthModal('login'); return; }
  try {
    const data = await API.toggleFavorite(eventId);
    const isFav = data.isFavorite;
    if (isFav) { if (!AppState.favorites.includes(eventId)) AppState.favorites.push(eventId); }
    else { AppState.favorites = AppState.favorites.filter(id => id !== eventId); }
    btn.classList.toggle('bookmarked', isFav);
    btn.innerHTML = isFav ? '❤️' : '🤍';
    showToast(isFav ? 'Added to favorites!' : 'Removed from favorites', 'info');
  } catch (err) {
    showToast(err.error || 'Failed to update favorite', 'error');
  }
}

// ===== REGISTRATION OTP FLOW =====
let regOtpState = { eventId: null, otp: null, email: '', uid: '', step: 1 };

function quickRegister(eventId) {
  if (!AppState.isLoggedIn()) { openAuthModal('login'); return; }
  if (AppState.isRegistered(eventId)) { showToast('You are already registered', 'info'); return; }
  regOtpState = { eventId, otp: null, email: '', uid: '', step: 1 };
  openRegModal(eventId);
}

function openRegModal(eventId) {
  let modal = document.getElementById('regOtpModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'regOtpModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Fetch event details from API if not available locally
  renderRegStep(eventId);
}

function closeRegModal() {
  const modal = document.getElementById('regOtpModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

async function renderRegStep(eventIdOrEvent) {
  const modal = document.getElementById('regOtpModal');
  if (!modal) return;

  let ev;
  if (typeof eventIdOrEvent === 'object') {
    ev = eventIdOrEvent;
  } else {
    const eid = eventIdOrEvent || regOtpState.eventId;
    ev = getEventById(eid);
    if (!ev) {
      try {
        const data = await API.getEvent(eid);
        ev = data.event;
      } catch (e) {
        showToast('Event not found', 'error');
        closeRegModal();
        return;
      }
    }
  }

  const catColor = categoryColors[ev.category] || '#6B7280';

  if (regOtpState.step === 1) {
    const u = AppState.currentUser;
    const prefillEmail = regOtpState.email || u?.email || '';
    const prefillName = u?.name || '';
    const prefillCollege = u?.college || '';
    modal.innerHTML = `
        <div class="modal" style="max-width:440px;">
            <button class="close-modal" onclick="closeRegModal()">&times;</button>
            <div style="text-align:center;margin-bottom:1.2rem;">
                <div style="width:52px;height:52px;border-radius:14px;background:${catColor}15;display:flex;align-items:center;justify-content:center;margin:0 auto 0.8rem;font-size:1.5rem;">${ev.organizer_logo || ev.organizerLogo || '📋'}</div>
                <h2 style="font-size:1.15rem;letter-spacing:-0.02em;">Register for Event</h2>
                <p class="subtitle" style="margin-bottom:0.5rem;">${ev.title}</p>
                <div style="display:flex;justify-content:center;gap:1rem;font-size:0.78rem;color:var(--text-tertiary);">
                    <span>📅 ${formatDate(ev.date)}</span>
                    <span>📍 ${ev.venue}</span>
                </div>
            </div>
            <div style="display:flex;justify-content:center;gap:0.4rem;margin-bottom:1.5rem;">
                <span class="reg-step-dot active">1</span>
                <span class="reg-step-line"></span>
                <span class="reg-step-dot">2</span>
                <span class="reg-step-line"></span>
                <span class="reg-step-dot">3</span>
            </div>
            <form onsubmit="handleRegStep1(event)">
                <div class="form-group">
                    <label>Email Address *</label>
                    <input type="email" id="regEmail" placeholder="youremail@gmail.com" required value="${prefillEmail}">
                    <small style="font-size:0.72rem;color:var(--text-tertiary);margin-top:0.2rem;display:block;">Gmail, CU email, or any valid email</small>
                </div>
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="regName" placeholder="Your full name" required value="${prefillName}">
                </div>
                <div class="form-group">
                    <label>College / University <span style="color:var(--text-tertiary);font-weight:400">(optional)</span></label>
                    <input type="text" id="regCollege" placeholder="e.g., Chandigarh University" value="${prefillCollege}">
                </div>
                <div class="form-group">
                    <label>Phone <span style="color:var(--text-tertiary);font-weight:400">(optional)</span></label>
                    <input type="tel" id="regPhone" placeholder="+91-XXXXXXXXXX">
                </div>
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:0.5rem;">Send Verification OTP →</button>
            </form>
        </div>`;
  } else if (regOtpState.step === 2) {
    modal.innerHTML = `
        <div class="modal" style="max-width:440px;">
            <button class="close-modal" onclick="closeRegModal()">&times;</button>
            <div style="text-align:center;margin-bottom:1.2rem;">
                <div style="width:52px;height:52px;border-radius:14px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;margin:0 auto 0.8rem;font-size:1.5rem;">📧</div>
                <h2 style="font-size:1.15rem;letter-spacing:-0.02em;">Verify Your Email</h2>
                <p class="subtitle">We've sent a 6-digit OTP to</p>
                <p style="font-weight:600;color:var(--text);font-size:0.9rem;">${regOtpState.email}</p>
            </div>
            <div style="display:flex;justify-content:center;gap:0.4rem;margin-bottom:1.5rem;">
                <span class="reg-step-dot completed">✓</span>
                <span class="reg-step-line completed"></span>
                <span class="reg-step-dot active">2</span>
                <span class="reg-step-line"></span>
                <span class="reg-step-dot">3</span>
            </div>
            <form onsubmit="handleRegStep2(event)">
                <div class="form-group">
                    <label>Enter OTP Code</label>
                    <div class="otp-inputs" id="otpInputs">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)" autofocus>
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                    </div>
                    <div id="otpError" style="color:var(--red);font-size:0.8rem;text-align:center;margin-top:0.5rem;display:none;"></div>
                </div>
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:0.3rem;">Verify & Register →</button>
                <div style="text-align:center;margin-top:0.8rem;">
                    <button type="button" onclick="resendOtp()" class="btn btn-sm btn-secondary" style="font-size:0.78rem;">Resend OTP</button>
                    <button type="button" onclick="regOtpState.step=1;renderRegStep()" class="btn btn-sm btn-secondary" style="font-size:0.78rem;">← Change Email</button>
                </div>
            </form>
        </div>`;
    setTimeout(() => { document.querySelector('.otp-box')?.focus(); }, 100);
  } else if (regOtpState.step === 3) {
    modal.innerHTML = `
        <div class="modal" style="max-width:440px;">
            <button class="close-modal" onclick="closeRegModal()">&times;</button>
            <div style="text-align:center;">
                <div style="display:flex;justify-content:center;gap:0.4rem;margin-bottom:1.5rem;">
                    <span class="reg-step-dot completed">✓</span>
                    <span class="reg-step-line completed"></span>
                    <span class="reg-step-dot completed">✓</span>
                    <span class="reg-step-line completed"></span>
                    <span class="reg-step-dot completed">✓</span>
                </div>
                <div style="width:72px;height:72px;border-radius:50%;background:#ECFDF5;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:2rem;">✅</div>
                <h2 style="font-size:1.3rem;letter-spacing:-0.02em;margin-bottom:0.3rem;">Registration Complete!</h2>
                <p class="subtitle" style="margin-bottom:1rem;">You're all set for</p>
                <div style="background:var(--bg);border-radius:12px;padding:1rem;margin-bottom:1.2rem;border:1px solid var(--border);">
                    <h3 style="font-size:0.95rem;margin-bottom:0.4rem;">${ev.title}</h3>
                    <div style="display:flex;justify-content:center;gap:1rem;font-size:0.78rem;color:var(--text-tertiary);">
                        <span>📅 ${formatDate(ev.date)}</span>
                        <span>📍 ${ev.venue}</span>
                    </div>
                    <div style="display:flex;justify-content:center;gap:1rem;font-size:0.78rem;color:var(--text-tertiary);margin-top:0.3rem;">
                        <span>🆔 ${regOtpState.uid}</span>
                        <span>📧 ${regOtpState.email}</span>
                    </div>
                </div>
                <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:1rem;">A confirmation has been sent to your email. Check your dashboard for details.</p>
                <div style="display:flex;gap:0.5rem;justify-content:center;">
                    <a href="dashboard.html" class="btn btn-primary">Go to Dashboard</a>
                    <button class="btn btn-secondary" onclick="closeRegModal()">Close</button>
                </div>
            </div>
        </div>`;
  }
}

async function handleRegStep1(e) {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const name = document.getElementById('regName')?.value.trim() || '';
  const college = document.getElementById('regCollege')?.value.trim() || '';
  const phone = document.getElementById('regPhone')?.value.trim() || '';

  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address', 'error'); return;
  }

  regOtpState.uid = AppState.currentUser?.cu_id || email.split('@')[0];
  regOtpState.email = email;
  regOtpState.participantName = name;
  regOtpState.participantCollege = college;
  regOtpState.participantPhone = phone;

  try {
    const data = await API.sendOtp({
      eventId: regOtpState.eventId,
      uid: regOtpState.uid,
      email,
      participantName: name,
      participantCollege: college,
      participantPhone: phone
    });
    regOtpState.step = 2;
    if (data.devOtp) {
      showOtpToast(data.devOtp, email);
      regOtpState.otp = data.devOtp;
    } else {
      showToast(`OTP sent to ${email}`, 'success');
    }
    renderRegStep();
  } catch (err) {
    showToast(err.error || 'Failed to send OTP', 'error');
  }
}

async function handleRegStep2(e) {
  e.preventDefault();
  const boxes = document.querySelectorAll('.otp-box');
  const entered = Array.from(boxes).map(b => b.value).join('');
  const errEl = document.getElementById('otpError');

  if (entered.length !== 6) {
    if (errEl) { errEl.textContent = 'Please enter all 6 digits'; errEl.style.display = 'block'; }
    return;
  }

  try {
    const data = await API.verifyOtp({ eventId: regOtpState.eventId, otp: entered });
    // Reload user data to update registrations
    await AppState.loadUserData();
    regOtpState.step = 3;
    renderRegStep();
    if (typeof renderCurrentView === 'function') renderCurrentView();
  } catch (err) {
    if (errEl) { errEl.textContent = err.error || 'Invalid OTP'; errEl.style.display = 'block'; }
    boxes.forEach(b => { b.value = ''; b.style.borderColor = 'var(--red)'; });
    boxes[0]?.focus();
  }
}

async function resendOtp() {
  try {
    const data = await API.sendOtp({ eventId: regOtpState.eventId, uid: regOtpState.uid, email: regOtpState.email });
    if (data.devOtp) {
      showOtpToast(data.devOtp, regOtpState.email);
    } else {
      showToast(`New OTP sent to ${regOtpState.email}`, 'success');
    }
    document.querySelectorAll('.otp-box').forEach(b => { b.value = ''; b.style.borderColor = ''; });
    document.querySelector('.otp-box')?.focus();
  } catch (err) {
    showToast(err.error || 'Failed to resend OTP', 'error');
  }
}

function otpBoxNext(el) {
  el.value = el.value.replace(/[^0-9]/g, '');
  if (el.value && el.nextElementSibling?.classList.contains('otp-box')) {
    el.nextElementSibling.focus();
  }
}
function otpBoxPrev(e, el) {
  if (e.key === 'Backspace' && !el.value && el.previousElementSibling?.classList.contains('otp-box')) {
    el.previousElementSibling.focus();
  }
}

// ===== COUNTDOWN TIMER =====
function startCountdown(targetDate, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  function update() {
    const now = Date.now();
    const dist = new Date(targetDate).getTime() - now;
    if (dist < 0) { el.innerHTML = '<span style="color:var(--green);font-weight:600;">Event Started!</span>'; return; }
    const d = Math.floor(dist / 86400000);
    const h = Math.floor((dist % 86400000) / 3600000);
    const m = Math.floor((dist % 3600000) / 60000);
    const s = Math.floor((dist % 60000) / 1000);
    el.innerHTML = `
      <div class="time-block"><span class="time-value">${d}</span><span class="time-label">Days</span></div>
      <div class="time-block"><span class="time-value">${h}</span><span class="time-label">Hours</span></div>
      <div class="time-block"><span class="time-value">${m}</span><span class="time-label">Mins</span></div>
      <div class="time-block"><span class="time-value">${s}</span><span class="time-label">Secs</span></div>`;
  }
  update();
  setInterval(update, 1000);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));
}

// ===== ANIMATED COUNTERS =====
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current.toLocaleString() + suffix;
  }, 20);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const target = parseInt(entry.target.dataset.target);
        const suffix = entry.target.dataset.suffix || '';
        animateCounter(entry.target, target, suffix);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
}

// ===== HELPER: FORMAT DATE =====
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(timeStr) {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

// ===== GENERATE NAVBAR HTML =====
function getNavbarHTML() {
  const isOrganiser = AppState.currentUser?.role === 'organiser';
  const dashLink = isOrganiser ? 'organiser-dashboard.html' : 'dashboard.html';
  return `
  <nav class="navbar">
    <div class="container">
      <a href="index.html" class="nav-logo">🎓 CU <span>Events</span></a>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="events.html">Events</a></li>
        <li><a href="calendar.html">Calendar</a></li>
        <li><a href="clubs.html">Clubs</a></li>
        <li><a href="${dashLink}">Dashboard</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
      <div class="nav-actions">
        <div class="notif-wrapper">
          <button class="btn-icon nav-notif" onclick="toggleNotifDropdown(event)" title="Notifications">
            🔔 <span class="badge" style="display:none">0</span>
          </button>
          <div class="notif-dropdown" id="notifDropdown">
            <div class="notif-dropdown__header">
              <h3>Notifications</h3>
              <button onclick="markAllReadFromDropdown()">Mark all read</button>
            </div>
            <div class="notif-dropdown__body"></div>
            <div class="notif-dropdown__footer">
              <a href="${dashLink}#notifications">View all notifications →</a>
            </div>
          </div>
        </div>
        <div class="notif-overlay" onclick="closeNotifDropdown()"></div>
        <button class="btn btn-sm btn-primary auth-btn" onclick="openAuthModal('login')">Login</button>
        <button class="btn-icon profile-btn" onclick="window.location.href='${dashLink}'" style="display:none;background:var(--primary);color:white;font-weight:700;"></button>
        <button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </nav>
  <div class="mobile-overlay"></div>
  <div class="mobile-menu">
    <button class="close-btn">&times;</button>
    <div style="margin-top:1rem;">
      <a href="index.html" class="nav-logo" style="font-size:1.1rem;">🎓 CU <span>Events</span></a>
    </div>
    <ul class="mobile-nav-links">
      <li><a href="index.html">🏠 Home</a></li>
      <li><a href="events.html">🎫 Events</a></li>
      <li><a href="calendar.html">📅 Calendar</a></li>
      <li><a href="clubs.html">👥 Clubs & Societies</a></li>
      <li><a href="${dashLink}">📊 Dashboard</a></li>
      <li><a href="about.html">ℹ️ About CU</a></li>
      <li><a href="contact.html">📞 Contact</a></li>
    </ul>
    <div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:0.5rem;">
      <button class="btn btn-primary auth-btn" onclick="openAuthModal('login')">Login / Sign Up</button>
      <button class="btn btn-secondary profile-btn" onclick="logout()" style="display:none">Logout</button>
    </div>
  </div>`;
}

function getAuthModalHTML() {
  return `
  <div class="modal-overlay" id="authModal">
    <div class="modal" style="max-width:480px;">
      <button class="close-modal" onclick="closeAuthModal()">&times;</button>

      <!-- LOGIN FORM -->
      <div id="loginForm" class="tab-content active">
        <h2>Welcome Back 👋</h2>
        <p class="subtitle">Login to CU Events</p>
        <form onsubmit="handleLogin(event)">
          <div class="form-group"><label>Email or CU ID</label><input type="text" name="identifier" placeholder="you@gmail.com or CU2024CSE001" required></div>
          <div class="form-group"><label>Password</label><input type="password" name="password" placeholder="Enter password" required></div>
          <div class="form-check"><input type="checkbox" id="remember"><label for="remember">Remember me</label></div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;">Login</button>
        </form>
        <div class="form-divider">OR</div>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn-google" style="flex:1;" onclick="demoLogin('attendee')">🎫 Demo Attendee</button>
          <button class="btn-google" style="flex:1;" onclick="demoLogin('organiser')">🎯 Demo Organiser</button>
        </div>
        <p class="form-footer">Don't have an account? <a href="#" onclick="showAuthForm('signup-role')">Sign up</a></p>
      </div>

      <!-- ROLE SELECTION -->
      <div id="signupRoleSelect" class="tab-content">
        <h2>Join CU Events 🚀</h2>
        <p class="subtitle">What best describes you?</p>
        <div class="role-cards">
          <div class="role-card" onclick="selectRole('attendee')">
            <div class="role-card__icon">🎫</div>
            <h3>I'm an Attendee</h3>
            <p>Discover, register & attend amazing campus events</p>
            <ul>
              <li>Browse 500+ events</li>
              <li>One-click registration</li>
              <li>Get event reminders</li>
            </ul>
            <span class="role-card__cta">Get Started →</span>
          </div>
          <div class="role-card role-card--organiser" onclick="selectRole('organiser')">
            <div class="role-card__icon">🎯</div>
            <h3>I'm an Organiser</h3>
            <p>Host, manage & promote events with powerful tools</p>
            <ul>
              <li>Create & publish events</li>
              <li>Track registrations & analytics</li>
              <li>PR & marketing tools</li>
            </ul>
            <span class="role-card__cta">Get Started →</span>
          </div>
        </div>
        <p class="form-footer">Already have an account? <a href="#" onclick="showAuthForm('login')">Login</a></p>
      </div>

      <!-- SIGNUP FORM (adapts to role) -->
      <div id="signupForm" class="tab-content">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
          <button class="btn btn-sm btn-secondary" onclick="showAuthForm('signup-role')" style="padding:0.3rem 0.6rem;">← Back</button>
          <span class="role-badge-inline" id="signupRoleBadge"></span>
        </div>
        <h2>Create Your Account</h2>
        <p class="subtitle" id="signupSubtitle">Fill in your details</p>
        <form onsubmit="handleSignup(event)" style="max-height:55vh;overflow-y:auto;padding-right:0.5rem;">
          <div class="form-group"><label>Full Name *</label><input type="text" name="name" placeholder="Your full name" required></div>
          <div class="form-group"><label>Email *</label><input type="email" name="email" placeholder="you@gmail.com" required>
            <small style="font-size:0.72rem;color:var(--text-tertiary);margin-top:0.2rem;display:block;">Gmail, Outlook, CU email — any email works</small>
          </div>

          <!-- Organiser-only fields -->
          <div id="orgFields" style="display:none;">
            <div class="form-group"><label>Organization Name *</label><input type="text" name="organizationName" placeholder="e.g., CU Coding Club"></div>
            <div class="form-group"><label>Organization Type *</label>
              <select name="organizationType">
                <option value="">Select type</option>
                <option value="university_club">University Club</option>
                <option value="department">Department</option>
                <option value="external_org">External Organization</option>
                <option value="individual">Individual Organiser</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" id="signupCuIdGroup"><label>CU ID <span style="color:var(--text-tertiary);font-weight:400">(optional)</span></label><input type="text" name="cuId" placeholder="CU2024CSE001"></div>
            <div class="form-group"><label>Phone</label><input type="tel" name="phone" placeholder="+91..."></div>
          </div>
          <div class="form-group" id="signupCollegeGroup"><label>College / University</label>
            <input type="text" name="college" placeholder="Chandigarh University" value="Chandigarh University">
          </div>
          <div class="form-row">
            <div class="form-group"><label>Department</label>
              <select name="department"><option value="">Select</option><option>CSE</option><option>ECE</option><option>Mechanical</option><option>Civil</option><option>MBA</option><option>Design</option><option>Law</option><option>Hotel Management</option><option>Sciences</option><option>Other</option></select>
            </div>
            <div class="form-group"><label>Year</label>
              <select name="year"><option value="">Select</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Masters</option><option>PhD</option><option>Faculty</option></select>
            </div>
          </div>
          <div class="form-group"><label>Password *</label><input type="password" name="password" placeholder="Min 6 characters" required></div>
          <div class="form-group"><label>Confirm Password *</label><input type="password" name="confirmPassword" placeholder="Confirm password" required></div>
          <div class="form-check"><input type="checkbox" id="terms" required><label for="terms">I agree to Terms of Service</label></div>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;">Create Account</button>
        </form>
        <p class="form-footer">Already have an account? <a href="#" onclick="showAuthForm('login')">Login</a></p>
      </div>
    </div>
  </div>`;
}

async function demoLogin(role) {
  try {
    const data = await API.demoLogin(role || 'attendee');
    AppState.currentUser = data.user;
    await AppState.loadUserData();
    showToast('Logged in as ' + data.user.name + ' (Demo ' + (data.user.role || 'attendee') + ')', 'success');
    closeAuthModal();
    updateAuthUI();
    updateNotifBadge();
    if (data.user.role === 'organiser') {
      window.location.href = 'organiser-dashboard.html';
    }
  } catch (err) {
    showToast(err.error || 'Demo login failed', 'error');
  }
}

function getFooterHTML() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>🎓 CU Events</h3>
          <p>The official event management platform for Chandigarh University. Discover, register, and experience the best of campus life.</p>
          <p style="margin-top:0.5rem;font-size:0.85rem;">Learn. Lead. Succeed.</p>
          <div class="footer-social">
            <a href="#" title="Instagram">📷</a><a href="#" title="Facebook">📘</a>
            <a href="#" title="Twitter">🐦</a><a href="#" title="LinkedIn">💼</a><a href="#" title="YouTube">📺</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul><li><a href="events.html">All Events</a></li><li><a href="create-event.html">Create Event</a></li>
          <li><a href="dashboard.html">My Dashboard</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Help & FAQ</a></li></ul>
        </div>
        <div class="footer-col">
          <h4>Categories</h4>
          <ul><li><a href="events.html?cat=Academic">Academic</a></li><li><a href="events.html?cat=Technical">Technical</a></li>
          <li><a href="events.html?cat=Cultural">Cultural</a></li><li><a href="events.html?cat=Sports">Sports</a></li>
          <li><a href="events.html?cat=Entertainment">Entertainment</a></li></ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul><li><a href="mailto:events@cumail.in">📧 events@cumail.in</a></li><li><a href="tel:+911234567890">📞 +91-1234567890</a></li>
          <li>📍 Chandigarh University, Gharuan, Mohali, Punjab</li></ul>
        </div>
      </div>
      <div class="footer-bottom">© 2026 Chandigarh University. All rights reserved. | CU Events Platform</div>
    </div>
  </footer>`;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  await AppState.init();
  // Inject navbar
  const navSlot = document.getElementById('navbar-slot');
  if (navSlot) navSlot.innerHTML = getNavbarHTML();
  // Inject auth modal
  const authSlot = document.getElementById('auth-modal-slot');
  if (authSlot) authSlot.innerHTML = getAuthModalHTML();
  // Inject footer
  const footerSlot = document.getElementById('footer-slot');
  if (footerSlot) footerSlot.innerHTML = getFooterHTML();
  // Init features
  initNavbar();
  // Load user data if logged in
  if (AppState.isLoggedIn()) {
    await AppState.loadUserData();
    updateNotifBadge();
  }
  // Load events from API (so newly created events appear everywhere)
  await loadApiEvents();
  setTimeout(initScrollAnimations, 100);
  setTimeout(initCounters, 200);

  // ===== SUPABASE REALTIME =====
  initSupabaseRealtime();

  // Signal that AppState is fully initialized
  _resolveAppReady();
});

function initSupabaseRealtime() {
  if (typeof window._supabaseRealtime !== 'undefined') return; // already init

  const SUPABASE_URL = 'https://pqxposmmgxutepbbtelp.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_d220ulkGs-nsyitbKaAZEA_dGnXHAQW';

  // Dynamically load Supabase JS SDK if not already loaded
  if (typeof supabase === 'undefined' || typeof supabase?.createClient !== 'function') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    script.onload = () => setupRealtime(SUPABASE_URL, SUPABASE_ANON_KEY);
    document.head.appendChild(script);
  } else {
    setupRealtime(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

function setupRealtime(url, key) {
  try {
    const _supaClient = window.supabase.createClient(url, key);
    window._supabaseRealtime = _supaClient;

    // Subscribe to events table — update registered_count on cards live
    _supaClient
      .channel('public:events')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events' }, (payload) => {
        const updated = payload.new;
        if (!updated) return;

        // Update any event card on the page that matches this event id
        document.querySelectorAll(`.event-card[data-id="${updated.id}"]`).forEach(card => {
          const pct = Math.round((updated.registered_count || 0) / (updated.capacity || 1) * 100);

          const attendanceEl = card.querySelector('.attendance');
          if (attendanceEl) attendanceEl.textContent = `${updated.registered_count}/${updated.capacity} registered`;

          const barFill = card.querySelector('.seats-bar-fill');
          if (barFill) {
            barFill.style.width = pct + '%';
            barFill.classList.toggle('almost-full', pct > 80);
          }
        });

        // Also update event-details page if we're on it
        const countEl = document.getElementById('liveRegCount');
        if (countEl && document.querySelector(`[data-event-id="${updated.id}"]`)) {
          countEl.textContent = updated.registered_count;
        }
      })
      .subscribe();

    // Subscribe to notifications table — update bell badge live
    _supaClient
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const notif = payload.new;
        if (!notif) return;
        if (AppState.currentUser && notif.user_id === AppState.currentUser.id) {
          AppState._unreadCount = (AppState._unreadCount || 0) + 1;
          AppState.notifications.unshift(notif);
          updateNotifBadge();
          showToast(notif.message, notif.type || 'info');
        }
      })
      .subscribe();

    console.log('✅ Supabase Realtime connected');
  } catch (err) {
    console.warn('Supabase Realtime init failed:', err.message);
  }
}
