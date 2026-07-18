// ===== EVENTS LISTING PAGE LOGIC =====
let currentPage = 1;
const perPage = 12;
let filteredEvents = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof AppState !== 'undefined' && AppState.ready) await AppState.ready;
    populateVenueFilter();
    applyURLParams();
    await applyFilters();
});

function populateVenueFilter() {
    const sel = document.getElementById('venueFilter');
    if (!sel) return;
    const venues = [...new Set(getAllEvents().map(e => e.venue).filter(Boolean))];
    venues.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o); });
}

function applyURLParams() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    const q = params.get('q');
    const price = params.get('price');
    const date = params.get('date');
    if (cat) {
        document.querySelectorAll('.filter-card input[type="checkbox"]').forEach(cb => {
            if (cb.value === cat) cb.checked = true;
        });
    }
    if (q) document.getElementById('eventSearch').value = q;
    if (price) document.querySelector(`input[name="priceFilter"][value="${price}"]`)?.click();
    if (date) document.querySelector(`input[name="dateFilter"][value="${date}"]`)?.click();
}

async function applyFilters() {
    const search = document.getElementById('eventSearch')?.value.toLowerCase() || '';
    const dateFilter = document.querySelector('input[name="dateFilter"]:checked')?.value || 'all';
    const priceFilter = document.querySelector('input[name="priceFilter"]:checked')?.value || 'all';
    const venueFilter = document.getElementById('venueFilter')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'date';
    const cats = [...document.querySelectorAll('.filter-card input[type="checkbox"]:checked')].map(c => c.value);

    // Always fetch fresh from API
    let allEvents = [];
    try {
        const params = {};
        if (cats.length === 1) params.category = cats[0];
        if (search) params.search = search;
        if (dateFilter !== 'all') params.date = dateFilter;
        if (priceFilter !== 'all') params.price = priceFilter;
        if (venueFilter) params.venue = venueFilter;
        if (sortBy === 'date') params.sort = 'date_asc';
        else if (sortBy === 'popular') params.sort = 'popular';
        else if (sortBy === 'name') params.sort = 'title';
        params.limit = 100;

        const data = await API.getEvents(params);
        allEvents = data.events || [];
    } catch (err) {
        console.warn('API fetch failed, falling back to local data:', err);
        allEvents = getAllEvents();
    }

    // Client-side filtering for multi-category (API only supports single)
    if (cats.length > 1) {
        allEvents = allEvents.filter(e => cats.includes(e.category));
    }

    // Client-side date filtering (API handles most, but just in case)
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekLater = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
    const monthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString().split('T')[0];

    filteredEvents = allEvents.filter(e => {
        if (dateFilter === 'today' && e.date !== today) return false;
        if (dateFilter === 'week' && (e.date < today || e.date > weekLater)) return false;
        if (dateFilter === 'month' && (e.date < today || e.date > monthLater)) return false;
        if (priceFilter === 'free' && e.price !== 'Free' && e.price !== 'Free Entry') return false;
        if (priceFilter === 'paid' && (e.price === 'Free' || e.price === 'Free Entry')) return false;
        return true;
    });

    // Sort
    if (sortBy === 'date') filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sortBy === 'popular') filteredEvents.sort((a, b) => (b.registered_count||0) - (a.registered_count||0));
    else if (sortBy === 'name') filteredEvents.sort((a, b) => a.title.localeCompare(b.title));

    currentPage = 1;
    renderCurrentView();
    renderActiveFilters(cats, dateFilter, priceFilter, search);
}

function renderCurrentView() {
    const grid = document.getElementById('eventsGrid');
    const empty = document.getElementById('emptyState');
    const countEl = document.getElementById('eventsCount');
    if (!grid) return;

    const start = (currentPage - 1) * perPage;
    const pageEvents = filteredEvents.slice(start, start + perPage);

    if (filteredEvents.length === 0) {
        grid.style.display = 'none';
        if (empty) empty.style.display = '';
        if (countEl) countEl.textContent = 'No events found';
    } else {
        grid.style.display = '';
        if (empty) empty.style.display = 'none';
        if (countEl) countEl.textContent = `Showing ${filteredEvents.length} event${filteredEvents.length > 1 ? 's' : ''}`;
        grid.innerHTML = pageEvents.map(e => renderEventCard(e)).join('');
        setTimeout(initScrollAnimations, 50);
    }
    renderPagination();
}

function renderPagination() {
    const pag = document.getElementById('pagination');
    if (!pag) return;
    const total = Math.ceil(filteredEvents.length / perPage);
    if (total <= 1) { pag.innerHTML = ''; return; }
    let html = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">‹ Prev</button>`;
    for (let i = 1; i <= total; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button ${currentPage === total ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">Next ›</button>`;
    pag.innerHTML = html;
    if (window.refreshIcons) refreshIcons();
}

function goToPage(p) {
    currentPage = p;
    renderCurrentView();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function renderActiveFilters(cats, dateFilter, priceFilter, search) {
    const el = document.getElementById('activeFilters');
    if (!el) return;
    let chips = '';
    if (search) chips += `<span class="active-filter-chip">Search: "${search}" <button onclick="document.getElementById('eventSearch').value='';applyFilters()">×</button></span>`;
    cats.forEach(c => chips += `<span class="active-filter-chip">${c} <button onclick="document.querySelector('input[value=${c}]').checked=false;applyFilters()">×</button></span>`);
    if (dateFilter !== 'all') chips += `<span class="active-filter-chip">Date: ${dateFilter} <button onclick="document.querySelector('input[name=dateFilter][value=all]').checked=true;applyFilters()">×</button></span>`;
    if (priceFilter !== 'all') chips += `<span class="active-filter-chip">${priceFilter} <button onclick="document.querySelector('input[name=priceFilter][value=all]').checked=true;applyFilters()">×</button></span>`;
    el.innerHTML = chips;
}

function clearAllFilters() {
    document.getElementById('eventSearch').value = '';
    document.querySelectorAll('.filter-card input[type="checkbox"]').forEach(c => c.checked = false);
    document.querySelector('input[name="dateFilter"][value="all"]').checked = true;
    document.querySelector('input[name="priceFilter"][value="all"]').checked = true;
    document.getElementById('venueFilter').value = '';
    document.getElementById('sortBy').value = 'date';
    applyFilters();
}
