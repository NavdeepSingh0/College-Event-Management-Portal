// ===== CALENDAR PAGE =====
let calYear = new Date().getFullYear(), calMonth = new Date().getMonth();
const today = new Date();
let calendarEvents = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for AppState to be ready so API events are loaded
  if (typeof AppState !== 'undefined' && AppState.ready) await AppState.ready;
  // Load events from API for the calendar
  await loadCalendarEvents();
  renderCalendar();
});

async function loadCalendarEvents() {
  // Start with all static events
  const staticEvents = typeof cuEvents !== 'undefined' ? [...cuEvents] : [];

  let apiEvents = [];
  try {
    const data = await API.getEvents({ limit: 200 });
    apiEvents = data.events || [];
  } catch (e) {
    console.warn('Calendar: API events failed, using static data only');
  }

  // Build final list: start with static, then add API events that are unique
  const seen = new Set();
  const combined = [];

  // Add all static events
  staticEvents.forEach(e => {
    const key = (e.title || '').toLowerCase().trim() + '|' + (e.date || '');
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(e);
    }
  });

  // Add API events that don't duplicate a static event
  apiEvents.forEach(e => {
    const key = (e.title || '').toLowerCase().trim() + '|' + (e.date || '');
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(e);
    }
  });

  calendarEvents = combined;
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}

function goToToday() {
  calYear = today.getFullYear();
  calMonth = today.getMonth();
  renderCalendar();
}

function renderCalendar() {
  const title = document.getElementById('calMonthTitle');
  const grid = document.getElementById('calendarGrid');
  if (!title || !grid) return;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  title.textContent = `${months[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const allEvents = calendarEvents.length > 0 ? calendarEvents : getAllEvents();

  // Count total events this month for the summary
  let totalMonthEvents = 0;

  let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="cal-day-header">${d}</div>`).join('');

  // Empty cells for alignment
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day-cell cal-day-cell--empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = allEvents.filter(e => e.date === dateStr);
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
    const isPast = new Date(dateStr) < new Date(today.toDateString());
    totalMonthEvents += dayEvents.length;

    const hasEvents = dayEvents.length > 0;

    let eventsHTML = '';
    if (hasEvents) {
      eventsHTML = dayEvents.slice(0, 2).map(e => {
        const catColor = (typeof categoryColors !== 'undefined' ? categoryColors[e.category] : null) || '#6B7280';
        const timeStr = e.start_time || e.startTime || '';
        const formattedTime = timeStr ? formatCalTime(timeStr) : '';
        return `<div class="cal-event-chip" style="--chip-color:${catColor}" title="${e.title}${formattedTime ? ' • ' + formattedTime : ''}">
          <span class="cal-event-chip__dot" style="background:${catColor}"></span>
          <span class="cal-event-chip__title">${e.title}</span>
        </div>`;
      }).join('');
      if (dayEvents.length > 2) {
        eventsHTML += `<div class="cal-event-more">+${dayEvents.length - 2} more</div>`;
      }
    }

    html += `<div class="cal-day-cell ${isToday ? 'cal-day-cell--today' : ''} ${hasEvents ? 'cal-day-cell--has-events' : ''} ${isPast ? 'cal-day-cell--past' : ''}" onclick="showDateEvents('${dateStr}', ${d})">
      <div class="cal-day-number">${d}</div>
      <div class="cal-day-events">${eventsHTML}</div>
    </div>`;
  }
  grid.innerHTML = html;
    if (window.refreshIcons) refreshIcons();

  // Update month summary
  const summaryEl = document.getElementById('monthSummary');
  if (summaryEl) {
    summaryEl.innerHTML = `<span class="month-summary-count">${totalMonthEvents}</span> event${totalMonthEvents !== 1 ? 's' : ''} in ${months[calMonth]}`;
  }

  // Auto-select today if it's the current month
  if (today.getFullYear() === calYear && today.getMonth() === calMonth) {
    const todayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    showDateEvents(todayStr, today.getDate());
  } else {
    // Show first event day in the month
    const firstEventDay = allEvents.find(e => {
      const [y, m] = e.date.split('-');
      return parseInt(y) === calYear && parseInt(m) === calMonth + 1;
    });
    if (firstEventDay) {
      showDateEvents(firstEventDay.date, parseInt(firstEventDay.date.split('-')[2]));
    } else {
      const titleEl = document.getElementById('selectedDateTitle');
      const eventsEl = document.getElementById('dateEvents');
      if (titleEl) titleEl.textContent = 'Select a date';
      if (eventsEl) eventsEl.innerHTML = '<div class="cal-sidebar-empty"><div class="cal-sidebar-empty__icon">📅</div><p>Click on a date to see events</p></div>';
    }
  }
}

function showDateEvents(dateStr, day) {
  const allEvents = calendarEvents.length > 0 ? calendarEvents : getAllEvents();
  const events = allEvents.filter(e => e.date === dateStr);
  const titleEl = document.getElementById('selectedDateTitle');
  const eventsEl = document.getElementById('dateEvents');

  const dateObj = new Date(dateStr + 'T00:00:00');
  const formatted = dateObj.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  if (titleEl) titleEl.innerHTML = `<span class="cal-sidebar-date">${formatted}</span>`;

  // Highlight selected cell
  document.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('cal-day-cell--selected'));
  document.querySelectorAll('.cal-day-cell').forEach(c => {
    const numEl = c.querySelector('.cal-day-number');
    if (numEl && numEl.textContent == day) c.classList.add('cal-day-cell--selected');
  });

  if (events.length === 0) {
    eventsEl.innerHTML = '<div class="cal-sidebar-empty"><div class="cal-sidebar-empty__icon">🗓️</div><p>No events on this date</p><span>Try selecting a date with event indicators</span></div>';
    return;
  }

  eventsEl.innerHTML = `<div class="cal-sidebar-count">${events.length} event${events.length !== 1 ? 's' : ''}</div>` + events.map(e => {
    const catColor = (typeof categoryColors !== 'undefined' ? categoryColors[e.category] : null) || '#6B7280';
    const startTime = e.start_time || e.startTime || '';
    const endTime = e.end_time || e.endTime || '';
    const formattedStart = startTime ? formatCalTime(startTime) : '';
    const formattedEnd = endTime ? formatCalTime(endTime) : '';
    const timeRange = formattedStart ? `${formattedStart}${formattedEnd ? ' – ' + formattedEnd : ''}` : '';
    const pct = Math.round(((e.registered_count || e.registered || 0) / (e.capacity || 1)) * 100);

    return `
    <div class="cal-event-card" style="--event-color:${catColor}">
      <div class="cal-event-card__accent" style="background:${catColor}"></div>
      <div class="cal-event-card__body">
        <div class="cal-event-card__category" style="color:${catColor}">${e.category}</div>
        <h4 class="cal-event-card__title"><a href="event-details.html?id=${e.id}">${e.title}</a></h4>
        <div class="cal-event-card__meta">
          ${timeRange ? `<span>⏰ ${timeRange}</span>` : ''}
          <span>📍 ${e.venue}</span>
        </div>
        <div class="cal-event-card__organizer">
          <span class="cal-event-card__org-logo">${e.organizer_logo || e.organizerLogo || '📋'}</span>
          <span>${e.organizer}</span>
        </div>
        <div class="cal-event-card__footer">
          <div class="cal-event-card__seats">
            <div class="cal-event-card__seats-bar"><div class="cal-event-card__seats-fill" style="width:${pct}%;background:${pct > 80 ? '#ef4444' : catColor}"></div></div>
            <span>${e.registered_count || e.registered || 0}/${e.capacity} spots</span>
          </div>
          <span class="cal-event-card__price">${e.price}</span>
        </div>
        <div class="cal-event-card__actions">
          <a href="event-details.html?id=${e.id}" class="btn btn-sm btn-secondary">View Details</a>
          <button class="btn btn-sm btn-primary" onclick="quickRegister(${e.id})">Register</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function formatCalTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${h12}:${m} ${ampm}`;
}
