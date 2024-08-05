const express = require('express');
const router = express.Router();

// Home Page
router.get('/', (req, res) => {
    res.send('<h1>Welcome to the Event Management System</h1><a href="/register">Register</a><br><a href="/login">Login</a>');
});

// Register Page
router.get('/register', (req, res) => {
    res.send('<h1>Register Page</h1><form method="post" action="/register"><input type="text" name="username" placeholder="Username"/><br><input type="password" name="password" placeholder="Password"/><br><button type="submit">Register</button></form>');
});

router.post('/register', (req, res) => {
    // Register user logic here
    res.redirect('/login');
});

// Login Page
router.get('/login', (req, res) => {
    res.send('<h1>Login Page</h1><form method="post" action="/login"><input type="text" name="username" placeholder="Username"/><br><input type="password" name="password" placeholder="Password"/><br><button type="submit">Login</button></form>');
});

router.post('/login', (req, res) => {
    // Login user logic here
    res.redirect('/dashboard');
});

// Export the router
module.exports = router;
