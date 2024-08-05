const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// MongoDB connection
mongoose.connect('mongodb://localhost/event_management', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Mongoose models
const User = require('./models/User');
const Event = require('./models/Event');

// Serve static files (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Home page route
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Event Management System</h1><a href="/register">Register</a> <a href="/login">Login</a>');
});

// Register route
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    const newUser = new User({ name, email, password, role });
    newUser.save()
        .then(() => res.redirect('/login'))
        .catch(err => res.status(400).send('Error registering user: ' + err.message));
});

// Login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email, password })
        .then(user => {
            if (!user) {
                return res.status(400).send('Invalid email or password');
            }
            req.session.user = user;
            res.redirect('/dashboard');
        })
        .catch(err => res.status(400).send('Error logging in: ' + err.message));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.send(`<h1>Welcome ${req.session.user.name}</h1><a href="/logout">Logout</a>`);
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
