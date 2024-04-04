
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mydatabase', { 
    useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define User schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

// Create User model
const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Set up express-session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Home Page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Login Page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Registration Page
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

// Registration Route
app.post('/register', async (req, res) => {
    const { username,
             email, 
             password} = req.body;
    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }
        // Create new user
        const newUser = await User.create({ 
            username: username,
            email:email, 
            password: password });
        // Redirect to login page upon successful registration
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user in the database
        const user = await User.findOne({ username: username });
        if (!user || user.password !== password) {
            return res.status(401).send('Invalid username or password');
        }
        // Set session variable to indicate user is logged in
        req.session.isLoggedIn = true;
        res.redirect('/home');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Home Route
app.get('/home', (req, res) => {
    // Check if user is logged in
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.sendFile(__dirname + '/public/home.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
