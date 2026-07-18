// ===== CREATE EVENT WIZARD =====
let currentStep = 1;
const totalSteps = 5;
const eventData = {};
let posterDataUrl = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof AppState !== 'undefined' && AppState.ready) await AppState.ready;
  if (!AppState.isLoggedIn()) {
    showToast('Please login to create an event', 'warning');
    setTimeout(() => openAuthModal('login'), 500);
  }
  try { const d = localStorage.getItem('cu_event_draft'); if (d) Object.assign(eventData, JSON.parse(d)); } catch(_){}
  renderWizardProgress();
  renderStep(1);
});

function renderWizardProgress() {
  const el = document.getElementById('wizardProgress');
  if (!el) return;
  const labels = ['Basic Info', 'Details', 'Venue & Poster', 'Settings', 'Review'];
  el.innerHTML = `<div class="ce-progress">${labels.map((s, i) => {
    const n = i + 1;
    const cls = n < currentStep ? 'ce-progress__step--done' : n === currentStep ? 'ce-progress__step--active' : '';
    return `<div class="ce-progress__step ${cls}"><div class="ce-progress__dot">${n < currentStep ? '✓' : n}</div></div>${n < totalSteps ? '<div class="ce-progress__line ' + (n < currentStep ? 'ce-progress__line--done' : '') + '"></div>' : ''}`;
  }).join('')}</div>`;
}

function renderStep(step) {
  currentStep = step;
  renderWizardProgress();
  const form = document.getElementById('wizardForm');
  if (!form) return;
  const fns = [null, stepBasicInfo, stepDetails, stepVenuePoster, stepSettings, stepReview];
  form.innerHTML = (fns[step] || fns[1])();
  setupCharCounter('eShortDesc', 'shortDescCount', 200);
}

function setupCharCounter(id, cid, max) {
  const el = document.getElementById(id), c = document.getElementById(cid);
  if (el && c) { const u = () => c.textContent = el.value.length + '/' + max; u(); el.addEventListener('input', u); }
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function stepBasicInfo() {
  const cats = typeof categoryColors !== 'undefined' ? Object.keys(categoryColors) : ['Technical','Cultural','Sports','Academic','Workshop','Social'];
  return `<div class="ce-step">
    <div class="ce-step__header"><span class="ce-step__icon">📝</span><div><h2>Basic Information</h2></div></div>
    <div class="ce-step__body">
      <div class="form-group"><label>Event Title *</label><input type="text" id="eTitle" value="${esc(eventData.title)}" placeholder="e.g., TechSprint 2026"></div>
      <div class="form-group"><label>Tagline</label><input type="text" id="eTagline" value="${esc(eventData.tagline)}" placeholder="A catchy one-liner"></div>
      <div class="form-row">
        <div class="form-group"><label>Category *</label><select id="eCategory"><option value="">Select</option>${cats.map(c=>`<option ${eventData.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label>Organizer</label><input type="text" id="eOrganizer" value="${esc(eventData.organizer||(AppState.currentUser?.organization_name||AppState.currentUser?.name||''))}" placeholder="Club name"></div>
      </div>
      <div class="form-group"><label>Short Description *</label><textarea id="eShortDesc" rows="2" maxlength="200" placeholder="Brief description (max 200 chars)">${esc(eventData.shortDesc)}</textarea><small class="ce-char-count" id="shortDescCount"></small></div>
    </div>
    <div class="ce-step__nav"><a href="events.html" class="btn btn-secondary">Cancel</a><button class="btn btn-primary" onclick="saveStep(1)">Next →</button></div>
  </div>`;
}

function stepDetails() {
  return `<div class="ce-step">
    <div class="ce-step__header"><span class="ce-step__icon">📅</span><div><h2>Details & Schedule</h2></div></div>
    <div class="ce-step__body">
      <div class="form-group"><label>Full Description *</label><textarea id="eDesc" rows="4" placeholder="What will attendees learn or experience?">${esc(eventData.description)}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Event Date *</label><input type="date" id="eDate" value="${eventData.date||''}" min="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group"><label>Start Time *</label><input type="time" id="eStart" value="${eventData.startTime||''}" onchange="updateEndTimeMin()"></div>
        <div class="form-group"><label>End Time</label><input type="time" id="eEnd" value="${eventData.endTime||''}" ${eventData.startTime ? 'min="'+eventData.startTime+'"' : ''}></div>
      </div>
      <div class="form-group"><label>Registration Deadline</label><input type="date" id="eDeadline" value="${eventData.deadline||''}"></div>
    </div>
    <div class="ce-step__nav"><button class="btn btn-secondary" onclick="renderStep(1)">← Back</button><button class="btn btn-primary" onclick="saveStep(2)">Next →</button></div>
  </div>`;
}

function stepVenuePoster() {
  const venues = typeof cuVenues !== 'undefined' ? cuVenues : ['University Auditorium','Student Center','Block A Seminar Hall','Open Air Theatre'];
  const vType = eventData.venueType || 'On-Campus';
  return `<div class="ce-step">
    <div class="ce-step__header"><span class="ce-step__icon">📍</span><div><h2>Venue & Poster</h2></div></div>
    <div class="ce-step__body">
      <div class="form-row">
        <div class="form-group"><label>Venue Type *</label><select id="eVenueType" onchange="toggleVenueFields()"><option ${vType==='On-Campus'?'selected':''}>On-Campus</option><option ${vType==='Off-Campus'?'selected':''}>Off-Campus</option><option ${vType==='Virtual/Online'?'selected':''}>Virtual/Online</option></select></div>
        <div class="form-group"><label>Capacity *</label><input type="number" id="eCapacity" value="${eventData.capacity||100}" min="1"></div>
      </div>
      <div id="campusVenue" style="display:${vType==='Virtual/Online'?'none':'block'}">
        <div class="form-group"><label>Venue *</label><select id="eVenue"><option value="">Select</option>${venues.map(v=>`<option ${eventData.venue===v?'selected':''}>${v}</option>`).join('')}<option value="custom">Other</option></select></div>
      </div>
      <div id="onlineVenue" style="display:${vType==='Virtual/Online'?'block':'none'}">
        <div class="form-row">
          <div class="form-group"><label>Platform</label><select id="ePlatform"><option>Zoom</option><option>Google Meet</option><option>MS Teams</option></select></div>
          <div class="form-group"><label>Meeting Link</label><input type="url" id="eMeetLink" placeholder="Will be shared after registration"></div>
        </div>
      </div>
      <div class="ce-poster-section">
        <h3>🖼️ Event Poster / Flyer</h3>
        <p class="ce-poster-hint">Upload a poster image for your event page.</p>
        <div class="ce-poster-upload" onclick="document.getElementById('posterFile').click()">
          ${posterDataUrl||eventData.posterUrl
            ? `<img src="${posterDataUrl||eventData.posterUrl}" alt="Poster" class="ce-poster-preview-img"><div class="ce-poster-remove" onclick="event.stopPropagation();removePoster()">✕</div>`
            : `<div class="ce-poster-upload__placeholder"><div class="ce-poster-upload__icon">📸</div><div class="ce-poster-upload__text">Click to upload</div><div class="ce-poster-upload__hint">JPG, PNG — Max 5MB</div></div>`}
        </div>
        <input type="file" id="posterFile" accept="image/*" style="display:none" onchange="handlePosterUpload(event)">
        <div class="form-group" style="margin-top:0.5rem"><label>Or paste image URL</label><input type="url" id="ePosterUrl" value="${esc(eventData.posterUrl)}" placeholder="https://..." oninput="previewPosterUrl(this.value)"></div>
      </div>
    </div>
    <div class="ce-step__nav"><button class="btn btn-secondary" onclick="renderStep(2)">← Back</button><button class="btn btn-primary" onclick="saveStep(3)">Next →</button></div>
  </div>`;
}

function stepSettings() {
  const isPaid = eventData.price && eventData.price !== 'Free';
  return `<div class="ce-step">
    <div class="ce-step__header"><span class="ce-step__icon">⚙️</span><div><h2>Settings</h2></div></div>
    <div class="ce-step__body">
      <div class="form-row">
        <div class="form-group"><label>Fee</label><select id="eFeeType" onchange="toggleFeeField()"><option ${!isPaid?'selected':''}>Free</option><option ${isPaid?'selected':''}>Paid</option></select></div>
        <div class="form-group" id="feeAmountGroup" style="display:${isPaid?'block':'none'}"><label>Amount (₹)</label><input type="number" id="eFeeAmount" value="${eventData.feeAmount||0}" min="0"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Visibility</label><select id="eVisibility"><option value="public" ${eventData.visibility==='public'||!eventData.visibility?'selected':''}>🌍 Public</option><option value="cu_only" ${eventData.visibility==='cu_only'?'selected':''}>🎓 CU Only</option><option value="invite_only" ${eventData.visibility==='invite_only'?'selected':''}>🔒 Invite Only</option></select></div>
        <div class="form-group"><label>External</label><select id="eAllowExternal"><option value="1">✅ Allow</option><option value="0">❌ CU Only</option></select></div>
      </div>
      <div class="ce-options">
        <label class="ce-option"><input type="checkbox" id="eCert" ${eventData.certificate?'checked':''}><span>📜 Auto-generate certificates</span></label>
        <label class="ce-option"><input type="checkbox" id="eFeatured" ${eventData.featured?'checked':''}><span>⭐ Featured placement</span></label>
        <label class="ce-option"><input type="checkbox" id="eConfirmEmail" checked><span>📧 Confirmation email</span></label>
      </div>
      <div class="form-group" style="margin-top:0.8rem"><label>Tags <small style="color:var(--text-tertiary)">(comma separated)</small></label><input type="text" id="eTags" value="${esc(eventData.tags)}" placeholder="hackathon, AI, workshop..."></div>
      <div class="form-group"><label>Highlights <small style="color:var(--text-tertiary)">(one per line)</small></label><textarea id="eHighlights" rows="3" placeholder="Prizes worth ₹50,000&#10;Mentorship from experts">${esc(eventData.highlightsText)}</textarea></div>
    </div>
    <div class="ce-step__nav"><button class="btn btn-secondary" onclick="renderStep(3)">← Back</button><button class="btn btn-primary" onclick="saveStep(4)">Review →</button></div>
  </div>`;
}

function stepReview() {
  const catColor = (typeof categoryColors!=='undefined'?categoryColors[eventData.category]:null)||'#6B7280';
  const hl = (eventData.highlightsText||'').split('\n').filter(h=>h.trim());
  const tags = (eventData.tags||'').split(',').map(t=>t.trim()).filter(Boolean);
  const poster = posterDataUrl||eventData.posterUrl;
  return `<div class="ce-step">
    <div class="ce-step__header"><span class="ce-step__icon">👀</span><div><h2>Review & Publish</h2></div></div>
    <div class="ce-step__body">
      <div class="ce-preview">
        ${poster?`<div class="ce-preview__poster"><img src="${poster}" alt="Poster"></div>`:''}
        <div class="ce-preview__body">
          <span class="category-badge" style="background:${catColor};display:inline-block;margin-bottom:0.4rem;font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:4px;color:white">${eventData.category||'Category'}</span>
          <h3 class="ce-preview__title">${esc(eventData.title)||'Event Title'}</h3>
          <p class="ce-preview__desc">${esc(eventData.shortDesc||eventData.description)||'No description'}</p>
          <div class="ce-preview__meta">
            <span>📅 ${eventData.date||'TBD'}</span>
            <span>⏰ ${eventData.startTime||'–'} – ${eventData.endTime||''}</span>
            <span>📍 ${esc(eventData.venue)||'TBD'}</span>
            <span>👥 ${eventData.capacity||100}</span>
            <span>💰 ${eventData.price||'Free'}</span>
          </div>
          ${hl.length?`<div class="ce-preview__highlights">${hl.map(h=>`<span class="ce-preview__hl">✓ ${esc(h)}</span>`).join('')}</div>`:''}
          ${tags.length?`<div class="ce-preview__tags">${tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>`:''}
        </div>
      </div>
      <label class="ce-option" style="margin-top:0.8rem"><input type="checkbox" id="eTerms"><span>I agree to CU Event Guidelines</span></label>
    </div>
    <div class="ce-step__nav">
      <button class="btn btn-secondary" onclick="renderStep(4)">← Back</button>
      <div style="display:flex;gap:0.4rem"><button class="btn btn-secondary" onclick="saveDraft()">💾 Draft</button><button class="btn btn-primary" id="publishBtn" onclick="publishEvent()">🚀 Publish</button></div>
    </div>
  </div>`;
}

// Handlers
function toggleVenueFields() {
  const t = document.getElementById('eVenueType')?.value||'';
  const c = document.getElementById('campusVenue'), o = document.getElementById('onlineVenue');
  if(c) c.style.display = t==='Virtual/Online'?'none':'block';
  if(o) o.style.display = t==='Virtual/Online'?'block':'none';
}
function toggleFeeField() {
  const g = document.getElementById('feeAmountGroup');
  if(g) g.style.display = document.getElementById('eFeeType')?.value==='Paid'?'block':'none';
}
function handlePosterUpload(e) {
  const f = e.target.files?.[0]; if(!f) return;
  if(f.size>5*1024*1024){showToast('Max 5MB','error');return;}
  const r = new FileReader();
  r.onload = ev => { posterDataUrl=ev.target.result; eventData.posterUrl=posterDataUrl; renderStep(3); showToast('Poster uploaded!','success'); };
  r.readAsDataURL(f);
}
function removePoster() { posterDataUrl=null; eventData.posterUrl=''; renderStep(3); }
function previewPosterUrl(url) { if(url&&url.startsWith('http')){ posterDataUrl=null; eventData.posterUrl=url; } }
function updateEndTimeMin() {
  const start = document.getElementById('eStart')?.value;
  const endEl = document.getElementById('eEnd');
  if (start && endEl) {
    endEl.min = start;
    // If current end time is before start, clear it
    if (endEl.value && endEl.value < start) {
      endEl.value = '';
      showToast('End time cleared — must be after start time', 'warning');
    }
  }
}

function saveStep(step) {
  if(step===1){
    const t=document.getElementById('eTitle')?.value?.trim(); if(!t){showToast('Enter event title','error');return;}
    const c=document.getElementById('eCategory')?.value; if(!c){showToast('Select a category','error');return;}
    eventData.title=t; eventData.tagline=document.getElementById('eTagline')?.value?.trim()||'';
    eventData.category=c; eventData.organizer=document.getElementById('eOrganizer')?.value?.trim()||'';
    eventData.shortDesc=document.getElementById('eShortDesc')?.value?.trim()||'';
  } else if(step===2){
    const d=document.getElementById('eDate')?.value; if(!d){showToast('Select event date','error');return;}
    const startTime=document.getElementById('eStart')?.value||'';
    const endTime=document.getElementById('eEnd')?.value||'';
    if(startTime && endTime && endTime <= startTime){showToast('End time must be after start time','error');return;}
    eventData.description=document.getElementById('eDesc')?.value?.trim()||'';
    eventData.date=d; eventData.startTime=startTime;
    eventData.endTime=endTime; eventData.deadline=document.getElementById('eDeadline')?.value||'';
  } else if(step===3){
    eventData.venueType=document.getElementById('eVenueType')?.value||'On-Campus';
    eventData.venue=document.getElementById('eVenue')?.value||'';
    eventData.capacity=parseInt(document.getElementById('eCapacity')?.value||100);
    const u=document.getElementById('ePosterUrl')?.value?.trim(); if(u) eventData.posterUrl=u;
  } else if(step===4){
    const ft=document.getElementById('eFeeType')?.value||'Free';
    eventData.price=ft==='Free'?'Free':'₹'+(document.getElementById('eFeeAmount')?.value||0);
    eventData.feeAmount=document.getElementById('eFeeAmount')?.value;
    eventData.certificate=document.getElementById('eCert')?.checked||false;
    eventData.featured=document.getElementById('eFeatured')?.checked||false;
    eventData.tags=document.getElementById('eTags')?.value?.trim()||'';
    eventData.highlightsText=document.getElementById('eHighlights')?.value||'';
    eventData.visibility=document.getElementById('eVisibility')?.value||'public';
    eventData.allowExternal=document.getElementById('eAllowExternal')?.value||'1';
  }
  renderStep(step+1);
}

async function publishEvent() {
  if(!AppState.isLoggedIn()){openAuthModal('login');return;}
  if(!document.getElementById('eTerms')?.checked){showToast('Accept the terms','error');return;}
  const btn=document.getElementById('publishBtn');
  if(btn){btn.disabled=true;btn.textContent='Publishing...';}

  const payload = {
    title:eventData.title, category:eventData.category||'Technical',
    organizer:eventData.organizer||AppState.currentUser?.name||'Unknown', organizerLogo:'📋',
    date:eventData.date, startTime:eventData.startTime||'10:00', endTime:eventData.endTime||'17:00',
    venue:eventData.venue||'TBD', location:eventData.venue||'Chandigarh University',
    price:eventData.price||'Free', capacity:parseInt(eventData.capacity)||100,
    description:eventData.description||eventData.shortDesc||'',
    highlights:eventData.highlightsText?eventData.highlightsText.split('\n').filter(h=>h.trim()):[],
    tags:eventData.tags?eventData.tags.split(',').map(t=>t.trim()).filter(Boolean):[],
    certificate:eventData.certificate||false, featured:eventData.featured||false,
    visibility:eventData.visibility||'public', allowExternal:eventData.allowExternal!=='0',
    posterUrl:eventData.posterUrl||null
  };

  // Validate required fields
  if (!payload.title) { showToast('Event title is required','error'); if(btn){btn.disabled=false;btn.textContent='🚀 Publish';} return; }
  if (!payload.date) { showToast('Event date is required','error'); if(btn){btn.disabled=false;btn.textContent='🚀 Publish';} return; }

  try {
    const data = await API.createEvent(payload);
    localStorage.removeItem('cu_event_draft');
    showToast('🎉 Event published successfully!','success');
    setTimeout(()=>{window.location.href=`event-details.html?id=${data.event.id}`;},1500);
  } catch(err) {
    console.error('Publish failed:', err);

    // If auth failed, try re-login and retry once
    if (err?.error === 'Authentication required' || err?.error === 'Invalid or expired token') {
      showToast('Session expired, re-authenticating...','warning');
      try {
        const role = AppState.currentUser?.role || 'organiser';
        const loginData = await API.post('/auth/demo-login', { role });
        API.setToken(loginData.token);
        AppState.currentUser = loginData.user;
        // Retry
        const data = await API.createEvent(payload);
        localStorage.removeItem('cu_event_draft');
        showToast('🎉 Event published successfully!','success');
        setTimeout(()=>{window.location.href=`event-details.html?id=${data.event.id}`;},1500);
        return;
      } catch(retryErr) {
        console.error('Retry also failed:', retryErr);
      }
    }

    const msg = err?.error || err?.message || 'Failed to publish event';
    showToast(msg,'error');
    if(btn){btn.disabled=false;btn.textContent='🚀 Publish';}
  }
}

function saveDraft() { localStorage.setItem('cu_event_draft',JSON.stringify(eventData)); showToast('Draft saved!','success'); }
