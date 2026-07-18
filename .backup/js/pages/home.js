// ===== HOME PAGE LOGIC =====
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof AppState !== 'undefined' && AppState.ready) await AppState.ready;
    renderFeaturedEvents();
    renderUpcomingEvents();
    renderCategories();
    renderClubs();
    renderTestimonials();
    initLiveTicker();
    initHeroCarousel();
});

function renderFeaturedEvents() {
    const grid = document.getElementById('featuredEvents');
    if (!grid) return;
    const allEvts = getAllEvents();
    const featured = allEvts.filter(e => e.featured).slice(0, 6);
    grid.innerHTML = featured.length ? featured.map(e => renderEventCard(e)).join('') : allEvts.slice(0, 6).map(e => renderEventCard(e)).join('');
    setTimeout(initScrollAnimations, 50);
}

function renderUpcomingEvents() {
    const grid = document.getElementById('upcomingEvents');
    if (!grid) return;
    const sorted = [...getAllEvents()].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6);
    grid.innerHTML = sorted.map(e => renderEventCard(e)).join('');
    setTimeout(initScrollAnimations, 50);
}

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    const cats = [
        { name: 'Academic & Seminars', icon: 'graduation-cap', desc: 'Guest lectures, workshops, research', cat: 'Academic' },
        { name: 'Technical & IT', icon: 'laptop', desc: 'Hackathons, coding, tech talks', cat: 'Technical' },
        { name: 'Cultural & Arts', icon: '🎨', desc: 'Music, dance, drama, exhibitions', cat: 'Cultural' },
        { name: 'Sports & Fitness', icon: '⚽', desc: 'Tournaments, yoga, sports meets', cat: 'Sports' },
        { name: 'Entertainment', icon: 'mic', desc: 'Concerts, comedy, DJ nights', cat: 'Entertainment' },
        { name: 'Career & Placements', icon: 'briefcase', desc: 'Job fairs, mock interviews', cat: 'Career' },
        { name: 'Social & Community', icon: 'handshake', desc: 'Blood donation, NGO drives', cat: 'Social' },
        { name: 'Competitions', icon: '🏆', desc: 'Debates, quizzes, case studies', cat: 'Competition' }
    ];
    const counts = {};
    cuEvents.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
    grid.innerHTML = cats.map(c => `
    <a href="events.html?cat=${c.cat}" class="category-card fade-in">
      <span class="cat-icon"><i data-lucide="${c.icon}"></i></span>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <p style="margin-top:0.4rem;font-size:0.78rem;color:var(--primary);font-weight:600;">${counts[c.cat] || 0} events</p>
    </a>`).join('');
    setTimeout(initScrollAnimations, 50);
}

function renderClubs() {
    const scroll = document.getElementById('clubsScroll');
    if (!scroll) return;
    scroll.innerHTML = cuClubs.map(c => `
    <div class="club-card">
      <div class="club-icon"><i data-lucide="${c.logo}"></i></div>
      <h3>${c.name}</h3>
      <div class="club-meta">${c.members} members • ${c.upcomingEvents} events</div>
      <button class="btn btn-sm btn-primary" onclick="showToast('Following ${c.name}!','success')">Follow</button>
    </div>`).join('');
}

function renderTestimonials() {
    const slider = document.getElementById('testimonialsSlider');
    if (!slider) return;
    slider.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="stars">${'⭐'.repeat(t.rating)}</div>
      <p class="quote">"${t.quote}"</p>
      <div class="author">
        <div class="author-avatar">${t.name.charAt(0)}</div>
        <div class="author-info"><h4>${t.name}</h4><p>${t.department}, ${t.year}</p></div>
      </div>
    </div>`).join('');
}

function initLiveTicker() {
    const el = document.getElementById('liveTickerText');
    if (!el) return;
    const sorted = [...cuEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
    const next = sorted.find(e => new Date(e.date) >= new Date()) || sorted[0];
    if (next) {
        const d = new Date(next.date + 'T' + next.startTime);
        el.textContent = `Next: ${next.title} - ${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at ${formatTime(next.startTime)}`;
    }
}

function homeSearchHandler(val) {
    if (val.length > 2) {
        // Could show instant results; for now redirect on Enter
    }
}

function initHeroCarousel() {
    const pages = document.querySelectorAll('.book-page');
    if (!pages.length) return;

    let currentIndex = 0;
    let isAnimating = false;

    function updatePages() {
        pages.forEach((page, i) => {
            let diff = i - currentIndex;
            if (diff < 0) diff += pages.length;

            page.className = 'book-page';
            if (diff === 0) page.classList.add('state-1');
            else if (diff === 1) page.classList.add('state-2');
            else if (diff === 2) page.classList.add('state-3');
            else page.classList.add('state-hidden');
        });
    }

    updatePages();

    function flipNext() {
        if (isAnimating) return;
        isAnimating = true;

        const topPage = pages[currentIndex];
        topPage.className = 'book-page state-flipped';

        currentIndex = (currentIndex + 1) % pages.length;

        // Stagger the remaining cards moving up
        setTimeout(() => {
            pages.forEach((page, i) => {
                if (page !== topPage) {
                    let diff = i - currentIndex;
                    if (diff < 0) diff += pages.length;
                    page.className = 'book-page';
                    if (diff === 0) page.classList.add('state-1');
                    else if (diff === 1) page.classList.add('state-2');
                    else if (diff === 2) page.classList.add('state-3');
                    else page.classList.add('state-hidden');
                }
            });
        }, 150);

        setTimeout(() => {
            topPage.className = 'book-page state-hidden';
            isAnimating = false;
        }, 1100);
    }

    // Auto-play every 5 seconds
    setInterval(flipNext, 5000);

    // Click to flip
    const stack = document.getElementById('heroBookStack');
    if (stack) {
        stack.style.cursor = 'pointer';
        stack.addEventListener('click', flipNext);
    }
}
