const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.fmyrecqsitwnwyhporon',
    password: '@Tsukuyomi1',
    database: 'postgres',
});

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

async function updateDb() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        for (const [emoji, icon] of Object.entries(emojiMap)) {
            const res = await client.query('UPDATE events SET organizer_logo = $1 WHERE organizer_logo = $2', [icon, emoji]);
            if (res.rowCount > 0) {
                console.log(`Updated ${res.rowCount} events: replaced ${emoji} with ${icon}`);
            }
        }
        
        console.log('Database emojis successfully replaced with icon strings.');
    } catch (error) {
        console.error('Error updating DB:', error);
    } finally {
        await client.end();
    }
}

updateDb();
