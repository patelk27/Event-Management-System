const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'event_management_secret',
    resave: false,
    saveUninitialized: true
}));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const eventRoutes = require('./routes/event');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/event', eventRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
