// ===== EVENT DETAILS PAGE — API-DRIVEN =====
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof AppState !== 'undefined' && AppState.ready) await AppState.ready;

  const params = new URLSearchParams(window.location.search);
  const eventId = parseInt(params.get('id'));
  if (!eventId) {
    showError('No event ID provided');
    return;
  }

  try {
    const data = await API.getEvent(eventId);
    if (!data || !data.event) { showError('Event not found'); return; }
    const e = data.event;
    document.title = `${e.title} - CU Events`;
    document.getElementById('breadcrumbTitle').textContent = e.title;
    renderEventDetail(e);
  } catch (err) {
    // Fallback to static data
    const e = typeof getEventById === 'function' ? getEventById(eventId) : null;
    if (e) {
      document.title = `${e.title} - CU Events`;
      document.getElementById('breadcrumbTitle').textContent = e.title;
      renderEventDetail(e);
    } else {
      showError('Event not found');
    }
  }
});

function showError(msg) {
  document.getElementById('eventDetailContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❌</div>
      <h3>${msg}</h3>
      <p>This event may have been removed or doesn't exist.</p>
      <a href="events.html" class="btn btn-primary">Browse Events</a>
    </div>`;
}

function renderEventDetail(e) {
  const catColor = (typeof categoryColors !== 'undefined' ? categoryColors[e.category] : null) || '#6B7280';
  const registered = e.registered_count || e.registered || 0;
  const capacity = e.capacity || 100;
  const pct = capacity > 0 ? Math.round((registered / capacity) * 100) : 0;
  const startTime = e.start_time || e.startTime || '10:00';
  const endTime = e.end_time || e.endTime || '17:00';
  const dateStr = e.date ? new Date(e.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
  const isReg = e.isRegistered || (typeof AppState !== 'undefined' && AppState.isRegistered?.(e.id));
  const isFav = e.isFavorite || (typeof AppState !== 'undefined' && AppState.isFavorite?.(e.id));
  const highlights = Array.isArray(e.highlights) ? e.highlights : [];
  const tags = Array.isArray(e.tags) ? e.tags : [];
  const speakers = Array.isArray(e.speakers) ? e.speakers : [];
  const agenda = Array.isArray(e.agenda) ? e.agenda : [];
  const relatedEvents = Array.isArray(e.relatedEvents) ? e.relatedEvents : [];
  const posterUrl = e.poster_url || e.posterUrl || null;
  const orgLogo = e.organizer_logo || e.organizerLogo || '📋';

  const html = `
  <!-- EVENT HERO BANNER -->
  <div class="ed-hero" style="--cat-color: ${catColor};">
    ${posterUrl ? `<div class="ed-hero__poster"><img src="${posterUrl}" alt="${e.title} poster" onerror="this.style.display='none'"></div>` : ''}
    <div class="ed-hero__gradient"></div>
    <div class="ed-hero__content">
      <div class="ed-hero__badges">
        <span class="ed-badge" style="background:${catColor}">${e.category}</span>
        ${e.featured ? '<span class="ed-badge ed-badge--featured">⭐ Featured</span>' : ''}
        ${e.certificate ? '<span class="ed-badge ed-badge--cert">📜 Certificate</span>' : ''}
        ${e.visibility === 'cu_only' ? '<span class="ed-badge ed-badge--cu">🎓 CU Only</span>' : ''}
      </div>
      <h1 class="ed-hero__title">${e.title}</h1>
      <div class="ed-hero__meta">
        <span>${orgLogo} ${e.organizer || 'CU Events'}</span>
        <span>📅 ${dateStr}</span>
        <span>📍 ${e.venue || 'TBD'}</span>
      </div>
    </div>
  </div>

  <div class="ed-layout">
    <!-- MAIN CONTENT -->
    <div class="ed-main">

      <!-- Organizer Card -->
      <div class="ed-card ed-organizer">
        <div class="ed-organizer__avatar">${orgLogo}</div>
        <div class="ed-organizer__info">
          <h4>${e.organizer || 'Event Organizer'}</h4>
          <p>Event Organizer${e.location ? ' • ' + e.location : ''}</p>
        </div>
      </div>

      <!-- About -->
      <div class="ed-card">
        <h2 class="ed-card__title">📝 About This Event</h2>
        <div class="ed-card__body">
          <p class="ed-description">${(e.description || 'No description available.').replace(/\n/g, '<br>')}</p>
        </div>
      </div>

      <!-- Highlights -->
      ${highlights.length > 0 ? `
      <div class="ed-card">
        <h2 class="ed-card__title">✨ Event Highlights</h2>
        <div class="ed-card__body">
          <div class="ed-highlights">
            ${highlights.map(h => `<div class="ed-highlight"><span class="ed-highlight__check">✓</span><span>${h}</span></div>`).join('')}
          </div>
        </div>
      </div>` : ''}

      <!-- Agenda / Schedule -->
      ${agenda.length > 0 ? `
      <div class="ed-card">
        <h2 class="ed-card__title">🗓️ Event Schedule</h2>
        <div class="ed-card__body">
          <div class="ed-agenda">
            ${agenda.map(a => `
            <div class="ed-agenda__item">
              <div class="ed-agenda__time">${typeof formatTime === 'function' ? formatTime(a.time) : a.time}</div>
              <div class="ed-agenda__dot"></div>
              <div class="ed-agenda__activity">${a.activity}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>` : ''}

      <!-- Speakers -->
      ${speakers.length > 0 ? `
      <div class="ed-card">
        <h2 class="ed-card__title">🎙️ Speakers & Guests</h2>
        <div class="ed-card__body">
          <div class="ed-speakers">
            ${speakers.map(s => `
            <div class="ed-speaker">
              <div class="ed-speaker__avatar">${s.name?.charAt(0) || '?'}</div>
              <div class="ed-speaker__info">
                <h4>${s.name}</h4>
                <p class="ed-speaker__title">${s.designation || ''}</p>
                ${s.bio ? `<p class="ed-speaker__bio">${s.bio}</p>` : ''}
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>` : ''}

      <!-- Venue -->
      <div class="ed-card">
        <h2 class="ed-card__title">📍 Venue Information</h2>
        <div class="ed-card__body">
          <div class="ed-venue">
            <div class="ed-venue__icon">🏛️</div>
            <div class="ed-venue__info">
              <h4>${e.venue || 'To be announced'}</h4>
              <p>${e.location || 'Chandigarh University, Gharuan'}</p>
              <p class="ed-venue__cap">Capacity: ${capacity} people</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tags -->
      ${tags.length > 0 ? `
      <div class="ed-card">
        <h2 class="ed-card__title">🏷️ Tags</h2>
        <div class="ed-card__body">
          <div class="ed-tags">${tags.map(t => `<span class="ed-tag">#${t}</span>`).join('')}</div>
        </div>
      </div>` : ''}

      <!-- Related Events -->
      ${relatedEvents.length > 0 ? `
      <div class="ed-card">
        <h2 class="ed-card__title">🔗 Related Events</h2>
        <div class="ed-card__body">
          <div class="ed-related">
            ${relatedEvents.map(re => {
              const reCatColor = (typeof categoryColors !== 'undefined' ? categoryColors[re.category] : null) || '#6B7280';
              return `
              <a href="event-details.html?id=${re.id}" class="ed-related__card">
                <span class="ed-related__cat" style="color:${reCatColor}">${re.category}</span>
                <h4>${re.title}</h4>
                <p>${re.date} • ${re.venue || 'TBD'}</p>
              </a>`;
            }).join('')}
          </div>
        </div>
      </div>` : ''}
    </div>

    <!-- SIDEBAR -->
    <aside class="ed-sidebar">
      <div class="ed-reg-card">
        <div class="ed-reg-card__date">📅 ${dateStr}</div>
        <div class="ed-reg-card__countdown" id="countdown"></div>
        <ul class="ed-reg-card__info">
          <li><span>⏰</span><span>${typeof formatTime === 'function' ? formatTime(startTime) : startTime} - ${typeof formatTime === 'function' ? formatTime(endTime) : endTime}</span></li>
          <li><span>📍</span><span>${e.venue || 'TBD'}</span></li>
          <li><span>💰</span><span>${e.price || 'Free'}</span></li>
          <li><span>👥</span><span>${registered}/${capacity} registered</span></li>
          ${e.certificate ? '<li><span>📜</span><span>Certificate provided</span></li>' : ''}
        </ul>
        <div class="ed-reg-card__progress">
          <div class="ed-reg-card__progress-bar ${pct > 80 ? 'ed-reg-card__progress-bar--hot' : ''}" style="width:${pct}%"></div>
        </div>
        <p class="ed-reg-card__seats ${pct > 80 ? 'ed-reg-card__seats--hot' : ''}">${pct > 80 ? '🔥 Almost Full!' : `${capacity - registered} seats remaining`}</p>
        <div class="ed-reg-card__actions">
          <button class="btn btn-primary btn-lg ed-reg-btn" onclick="quickRegister(${e.id})" ${isReg ? 'disabled' : ''}>
            ${isReg ? '✓ Already Registered' : '🎫 Register Now'}
          </button>
          <div class="ed-reg-card__row">
            <button class="btn btn-secondary" onclick="toggleFav(${e.id},this)">${isFav ? '❤️ Saved' : '🤍 Save'}</button>
            <button class="btn btn-secondary" onclick="shareEvent(${e.id})">↗️ Share</button>
          </div>
        </div>
      </div>
    </aside>
  </div>`;

  document.getElementById('eventDetailContent').innerHTML = html;
  if (typeof startCountdown === 'function') startCountdown(e.date + 'T' + startTime, 'countdown');
  if (typeof initScrollAnimations === 'function') setTimeout(initScrollAnimations, 100);
}

function shareEvent(eventId) {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: 'Check out this CU Event!', url });
  } else {
    navigator.clipboard?.writeText(url);
    showToast('Event link copied to clipboard!', 'success');
  }
}
