const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/event-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String, // 'organiser' or 'attendee'
}));

const Event = mongoose.model('Event', new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  time: String,
  venue: String,
  organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}));

const Ticket = mongoose.model('Ticket', new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seatNumber: String,
  price: Number,
}));

// Helper functions
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
// Register
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).send('All fields are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });

  try {
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (err) {
    res.status(500).send('Error registering user');
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Invalid credentials');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid credentials');

  const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY);
  res.json({ token });
});

// Create Event
app.post('/events', authenticateToken, async (req, res) => {
  const { title, description, date, time, venue } = req.body;

  const event = new Event({
    title,
    description,
    date,
    time,
    venue,
    organiser: req.user.userId,
  });

  try {
    await event.save();
    res.status(201).send('Event created successfully');
  } catch (err) {
    res.status(500).send('Error creating event');
  }
});

// Book Ticket
app.post('/tickets', authenticateToken, async (req, res) => {
  const { eventId, seatNumber, price } = req.body;

  const ticket = new Ticket({
    event: eventId,
    user: req.user.userId,
    seatNumber,
    price,
  });

  try {
    await ticket.save();
    res.status(201).send('Ticket booked successfully');
  } catch (err) {
    res.status(500).send('Error booking ticket');
  }
});

// Continuous Integration: Integrate with GitHub Actions
// Create .github/workflows/ci.yml for GitHub Actions
const fs = require('fs');
const ciContent = `
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x]

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: \${{ matrix.node-version }}
    - run: npm install
    - run: npm test
`;

fs.mkdirSync('.github/workflows', { recursive: true });
fs.writeFileSync('.github/workflows/ci.yml', ciContent);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
