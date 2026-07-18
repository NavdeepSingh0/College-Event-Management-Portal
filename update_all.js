const fs = require('fs');
const path = require('path');

const emojiMap = {
    '🌟': 'star', '📅': 'calendar', '🎯': 'target', '👥': 'users', '🚀': 'rocket',
    '💬': 'message-square', '📧': 'mail', '🔍': 'search', '📂': 'folder', '💰': 'indian-rupee',
    '📍': 'map-pin', '➕': 'plus', '📝': 'edit', '⚙️': 'settings', '📊': 'bar-chart',
    '✅': 'check-circle', '❌': 'x-circle', '🎉': 'party-popper', '🏢': 'building',
    '📞': 'phone', '🎓': 'graduation-cap', '💻': 'laptop', '🎭': 'masks', '🏏': 'club',
    '📸': 'camera', '🧘': 'heart', '🏛️': 'landmark', '🎵': 'music', '🤖': 'bot',
    '💼': 'briefcase', '😂': 'smile', '🛡️': 'shield', '🎤': 'mic', '⛓️': 'link',
    '🤝': 'handshake', '🎬': 'clapperboard', '🏅': 'medal', '📋': 'clipboard'
};

function replaceEmojis(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [emoji, icon] of Object.entries(emojiMap)) {
        const regex = new RegExp(emoji, 'g');
        content = content.replace(regex, icon);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced emojis in ${filePath}`);
}

// 1. Replace emojis in data.js, routes/clubs.js, schema.sql
['js/data.js', 'server/routes/clubs.js', 'supabase/schema.sql', 'js/pages/home.js'].forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) replaceEmojis(fullPath);
});

// 2. Fix JS rendering logic
function updateRendering(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(r => {
        content = content.split(r.from).join(r.to);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated rendering in ${filePath}`);
}

updateRendering(path.join(__dirname, 'js/pages/home.js'), [
    { from: '<span class="cat-icon">${c.icon}</span>', to: '<span class="cat-icon"><i data-lucide="${c.icon}"></i></span>' },
    { from: '<div class="club-icon">${c.logo}</div>', to: '<div class="club-icon"><i data-lucide="${c.logo}"></i></div>' }
]);

updateRendering(path.join(__dirname, 'js/pages/clubs.js'), [
    { from: '<div class="club-logo">${c.logo}</div>', to: '<div class="club-logo"><i data-lucide="${c.logo}"></i></div>' }
]);

updateRendering(path.join(__dirname, 'js/pages/calendar.js'), [
    { from: '<span class="cal-event-card__org-logo">${e.organizer_logo || e.organizerLogo || \'clipboard\'}</span>', to: '<span class="cal-event-card__org-logo"><i data-lucide="${e.organizer_logo || e.organizerLogo || \'clipboard\'}"></i></span>' }
]);

updateRendering(path.join(__dirname, 'js/app.js'), [
    { from: '<div class="notif-item__icon notif-item__icon--${cls}">${icon}</div>', to: '<div class="notif-item__icon notif-item__icon--${cls}"><i data-lucide="${icon}"></i></div>' },
    { from: '<span class="org-icon">${event.organizer_logo || event.organizerLogo || \'clipboard\'}</span>', to: '<span class="org-icon"><i data-lucide="${event.organizer_logo || event.organizerLogo || \'clipboard\'}"></i></span>' },
    { from: '>${ev.organizer_logo || ev.organizerLogo || \'clipboard\'}</div>', to: '><i data-lucide="${ev.organizer_logo || ev.organizerLogo || \'clipboard\'}"></i></div>' },
    { from: "icon: 'info'", to: "icon: 'info'" } // just testing
]);

// 3. Add refreshIcons calls in app.js
let appJsPath = path.join(__dirname, 'js/app.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');
if (!appJsContent.includes('window.refreshIcons = ')) {
    appJsContent = appJsContent.replace('// Global API config', 'window.refreshIcons = () => { setTimeout(() => { if(window.lucide) lucide.createIcons(); }, 10); };\n// Global API config');
}
// Append refreshIcons() after common render functions if missing
const injections = [
    { find: 'container.innerHTML = html;', append: '\n    if (window.refreshIcons) refreshIcons();' },
    { find: 'el.innerHTML = html;', append: '\n    if (window.refreshIcons) refreshIcons();' },
    { find: 'eventsGrid.innerHTML = html;', append: '\n    if (window.refreshIcons) refreshIcons();' }
];

injections.forEach(inj => {
    appJsContent = appJsContent.split(inj.find).join(inj.find + inj.append);
});
fs.writeFileSync(appJsPath, appJsContent, 'utf8');
console.log('Injected refreshIcons into app.js');

// Add refreshIcons to home.js, clubs.js, calendar.js
['js/pages/home.js', 'js/pages/clubs.js', 'js/pages/calendar.js', 'js/pages/events.js'].forEach(file => {
    let content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    content = content.split('.innerHTML = html;').join('.innerHTML = html;\n    if (window.refreshIcons) refreshIcons();');
    fs.writeFileSync(path.join(__dirname, file), content, 'utf8');
});
