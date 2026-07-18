require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initMailer } = require('./utils/email');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/register', require('./routes/register'));
app.use('/api/registrations', require('./routes/register'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/organiser', require('./routes/organiser'));

// Start server
async function start() {
    await initMailer();
    app.listen(PORT, () => {
        console.log(`\n🎓 CU Events Server running at http://localhost:${PORT}`);
        console.log(`📦 API available at http://localhost:${PORT}/api`);
        console.log(`🌐 Frontend at http://localhost:${PORT}\n`);
    });
}

start().catch(console.error);
