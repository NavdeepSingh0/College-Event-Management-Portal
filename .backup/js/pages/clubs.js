// ===== CLUBS PAGE =====
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof AppState !== 'undefined' && AppState.ready) await AppState.ready;
  filterClubs();
});

async function filterClubs() {
  const search = document.getElementById('clubSearch')?.value.toLowerCase() || '';
  const cat = document.getElementById('clubCatFilter')?.value || '';

  try {
    const params = {};
    if (search) params.search = search;
    if (cat) params.category = cat;
    const data = await API.getClubs(params);
    renderClubsGrid(data.clubs || []);
  } catch (err) {
    // Fallback to static data
    let filtered = cuClubs.filter(c => {
      if (search && !c.name.toLowerCase().includes(search) && !c.description.toLowerCase().includes(search)) return false;
      if (cat && c.category !== cat) return false;
      return true;
    });
    renderClubsGrid(filtered);
  }
}

function renderClubsGrid(clubs) {
  const grid = document.getElementById('clubsGrid');
  if (!grid) return;
  if (clubs.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🔍</div><h3>No clubs found</h3></div>';
    return;
  }
  grid.innerHTML = clubs.map(c => `
    <div class="club-detail-card fade-in" id="club-card-${c.id}">
      <div class="club-header">
        <div class="club-logo"><i data-lucide="${c.logo}"></i></div>
        <h3>${c.name}</h3>
        <span class="club-cat">${c.category}</span>
      </div>
      <div class="club-body">
        <p>${c.description}</p>
        <div class="club-stats">
          <span><strong>${c.members}</strong> Members</span>
          <span><strong>${c.events || c.upcomingEvents || 0}</strong> Events</span>
          <span><strong>${c.founded}</strong> Founded</span>
        </div>
        <div style="display:flex;gap:0.5rem;">
          ${c.isMember
      ? `<button class="btn btn-sm" style="flex:1;background:var(--success);color:white;cursor:default;" disabled>✓ Member</button>
               <button class="btn btn-secondary btn-sm" style="flex:0 0 auto;" onclick="leaveClub(${c.id},'${c.name.replace(/'/g, "\\'")}')">Leave</button>`
      : `<button class="btn btn-primary btn-sm" style="flex:1;" onclick="joinClub(${c.id},'${c.name.replace(/'/g, "\\'")}')">Join Club</button>`
    }
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="window.location.href='events.html?q=${encodeURIComponent(c.name)}'">View Events</button>
        </div>
      </div>
    </div>`).join('');
  setTimeout(initScrollAnimations, 50);
}

// ===== CLUB JOIN OTP FLOW =====
let clubOtpState = { clubId: null, clubName: '', email: '', step: 1 };

function joinClub(clubId, clubName) {
  if (!AppState.isLoggedIn()) {
    showToast('Please login first to join a club', 'error');
    openAuthModal();
    return;
  }

  clubOtpState = { clubId, clubName, email: '', step: 1 };

  // Create modal if not exists
  let modal = document.getElementById('clubOtpModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'clubOtpModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  renderClubOtpStep();
}

function closeClubModal() {
  const modal = document.getElementById('clubOtpModal');
  if (modal) modal.style.display = 'none';
}

function renderClubOtpStep() {
  const modal = document.getElementById('clubOtpModal');
  if (!modal) return;

  if (clubOtpState.step === 1) {
    // Step 1: Confirm + Send OTP
    modal.innerHTML = `
        <div class="modal-content" style="max-width:440px;padding:2rem;">
            <button class="modal-close" onclick="closeClubModal()">&times;</button>
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:2.5rem;margin-bottom:0.5rem;">🏛️</div>
                <h2 style="font-size:1.15rem;letter-spacing:-0.02em;">Join ${clubOtpState.clubName}</h2>
                <p class="subtitle" style="margin-top:0.3rem;">Become a member and get access to exclusive events, resources, and community</p>
            </div>
            <div style="background:var(--bg-secondary);padding:1rem;border-radius:10px;margin-bottom:1.2rem;">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
                    ✅ Access to exclusive club events<br>
                    ✅ Get notified about club activities<br>
                    ✅ Network with fellow members<br>
                    ✅ Certificate of membership
                </p>
            </div>
            <p style="font-size:0.82rem;color:var(--text-tertiary);margin-bottom:1rem;text-align:center;">
                We'll send a verification OTP to your registered email to confirm membership.
            </p>
            <button class="btn btn-primary btn-lg" style="width:100%;justify-content:center;" onclick="sendClubOtp()">
                Send Verification OTP →
            </button>
        </div>`;
  } else if (clubOtpState.step === 2) {
    // Step 2: Enter OTP
    modal.innerHTML = `
        <div class="modal-content" style="max-width:440px;padding:2rem;">
            <button class="modal-close" onclick="closeClubModal()">&times;</button>
            <div style="text-align:center;margin-bottom:1.2rem;">
                <div style="font-size:2.5rem;margin-bottom:0.5rem;">🔐</div>
                <h2 style="font-size:1.15rem;">Verify Your Identity</h2>
                <p class="subtitle">We've sent a 6-digit OTP to</p>
                <p style="font-weight:600;color:var(--text);font-size:0.9rem;">${clubOtpState.email}</p>
            </div>
            <form onsubmit="handleClubOtpVerify(event)">
                <div class="form-group">
                    <label>Enter OTP Code</label>
                    <div class="otp-inputs" id="clubOtpInputs">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)" autofocus>
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                        <input type="text" maxlength="1" class="otp-box" oninput="otpBoxNext(this)" onkeydown="otpBoxPrev(event,this)">
                    </div>
                    <div id="clubOtpError" style="color:var(--red);font-size:0.8rem;text-align:center;margin-top:0.5rem;display:none;"></div>
                </div>
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:0.3rem;">Verify & Join →</button>
                <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:0.8rem;">
                    <button type="button" onclick="sendClubOtp()" class="btn btn-sm btn-secondary" style="font-size:0.78rem;">Resend OTP</button>
                    <button type="button" onclick="clubOtpState.step=1;renderClubOtpStep()" class="btn btn-sm btn-secondary" style="font-size:0.78rem;">← Back</button>
                </div>
            </form>
        </div>`;
    setTimeout(() => { document.querySelector('#clubOtpInputs .otp-box')?.focus(); }, 100);
  } else if (clubOtpState.step === 3) {
    // Step 3: Success
    modal.innerHTML = `
        <div class="modal-content" style="max-width:440px;padding:2rem;text-align:center;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">🎊</div>
            <h2 style="font-size:1.3rem;margin-bottom:0.5rem;">Welcome to ${clubOtpState.clubName}!</h2>
            <p class="subtitle" style="margin-bottom:1.5rem;">You are now an official member. The club secretary has been notified.</p>
            <div style="background:var(--bg-secondary);padding:1rem;border-radius:10px;margin-bottom:1.5rem;">
                <p style="font-size:0.85rem;font-weight:600;color:var(--text);">What's next?</p>
                <p style="font-size:0.82rem;color:var(--text-secondary);margin-top:0.3rem;line-height:1.6;">
                    You'll receive notifications about upcoming club events and activities.
                </p>
            </div>
            <button class="btn btn-primary btn-lg" style="width:100%;justify-content:center;" onclick="closeClubModal();filterClubs();">Done 🎉</button>
        </div>`;
  }
}

async function sendClubOtp() {
  try {
    const data = await API.joinClub(clubOtpState.clubId);
    clubOtpState.email = data.email;
    clubOtpState.step = 2;
    renderClubOtpStep();
    if (data.devOtp) {
      showOtpToast(data.devOtp, data.email);
    } else {
      showToast(`OTP sent to ${data.email}`, 'success');
    }
  } catch (err) {
    if (err.error && err.error.includes('already a member')) {
      showToast('You are already a member of this club!', 'info');
      closeClubModal();
      return;
    }
    showToast(err.error || 'Failed to send OTP', 'error');
  }
}

async function handleClubOtpVerify(e) {
  e.preventDefault();
  const boxes = document.querySelectorAll('#clubOtpInputs .otp-box');
  const entered = Array.from(boxes).map(b => b.value).join('');
  const errEl = document.getElementById('clubOtpError');

  if (entered.length !== 6) {
    if (errEl) { errEl.textContent = 'Please enter all 6 digits'; errEl.style.display = 'block'; }
    return;
  }

  try {
    await API.verifyClubOtp(clubOtpState.clubId, entered);
    clubOtpState.step = 3;
    renderClubOtpStep();
    showToast(`Welcome to ${clubOtpState.clubName}!`, 'success');
    // Refresh notification badge
    if (typeof updateNotifBadge === 'function') {
      await AppState.loadUserData();
      updateNotifBadge();
    }
  } catch (err) {
    if (errEl) { errEl.textContent = err.error || 'Invalid OTP'; errEl.style.display = 'block'; }
    boxes.forEach(b => { b.value = ''; b.style.borderColor = 'var(--red)'; });
    boxes[0]?.focus();
  }
}

async function leaveClub(clubId, clubName) {
  if (!confirm(`Leave "${clubName}"? You can rejoin later.`)) return;
  try {
    await API.leaveClub(clubId);
    showToast(`Left ${clubName}`, 'success');
    filterClubs();
  } catch (err) {
    showToast(err.error || 'Failed to leave club', 'error');
  }
}
