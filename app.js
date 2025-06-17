const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const superheroRoutes = require('./routes/superhero');
const profileRoutes = require('./routes/profile');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Special route for favicon.ico to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'images', 'favicon.svg'));
});

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.use(expressLayouts);

// Middleware
// Serve static files - ensure this is before other middleware
app.use(express.static(path.join(__dirname, 'public')));

// Specific route for CSS files with detailed error handling and more aggressive headers
app.get('/css/:file', (req, res) => {
    const cssPath = path.join(__dirname, 'public', 'css', req.params.file);
    console.log(`CSS file requested: ${req.params.file}, Full path: ${cssPath}`);
    
    // Check if file exists before sending
    if (require('fs').existsSync(cssPath)) {
        console.log(`CSS file exists: ${cssPath}`);
        
        // Set aggressive headers to prevent caching and ensure proper content type
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        // Read file and send with modified content to ensure it's recognized
        const css = require('fs').readFileSync(cssPath, 'utf8');
        res.send(`/* CSS file: ${req.params.file} - loaded at ${new Date().toISOString()} */\n${css}`);
    } else {
        console.log(`CSS file NOT found: ${cssPath}`);
        res.status(404).send(`CSS file ${req.params.file} not found`);
    }
});

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));
app.use(flash());

// Set global variables for templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/superhero', superheroRoutes);
app.use('/profile', profileRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/error', { 
        title: 'Error', 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('pages/404', { title: 'Page Not Found' });
});

// Import database checker
const dbChecker = require('./utils/dbChecker');

// Import index utility
const indexUtils = require('./utils/indexUtils');

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Check if database has superhero data
    try {
        const hasData = await dbChecker.checkDatabaseHasData();
        if (!hasData) {
            console.log('\n=========================================');
            console.log('⚠️  NOTICE: Superhero database is empty!');
            console.log('To populate the database with superheroes:');
            console.log('1. Make sure your .env file is set up with:');
            console.log('   SUPERHERO_API_KEY=your_api_key_here');
            console.log('2. Run the following command:');
            console.log('   npm run init-db');
            console.log('=========================================\n');
        } else {
            console.log('✅ Superhero database contains data');
        }
        
        // Ensure that text index exists
        await indexUtils.ensureTextIndex();
    } catch (error) {
        console.error('Error during startup checks:', error);
    }
});

module.exports = app;
