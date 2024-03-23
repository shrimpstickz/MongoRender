const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const uri = "mongodb+srv://ml:68RrzjSSGJzyVgGi@cluster0.ef6txkd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

// Default endpoint
app.get('/', (req, res) => {
    if (req.cookies.auth) {
        res.send(`Authentication cookies exists with these value: ${req.cookies.auth}<br><a href="/cookies">View All Active Cookies</a> | <a href="/clear-cookie">Clear All Cookies Here</a>`);
    } else {
        res.send('<a href="/login">Login Here</a> | <a href="/register">Register Here</a>');
    }
});

// Login endpoint
app.get('/login', (req, res) => {
    res.send('<form method="post" action="/login">\
                <input type="text" name="user_ID" placeholder="User ID"><br>\
                <input type="password" name="password" placeholder="Password"><br>\
                <input type="submit" value="Login">\
              </form>');
});

app.post('/login', async (req, res) => {
    const { user_ID, password } = req.body;
    const database = client.db('MyDBexample');
    const users = database.collection('Users');
    const user = await users.findOne({ user_ID, password });
    if (user) {
        res.cookie('auth', 'authenticated', { maxAge: 60000 });
        res.redirect('/');
    } else {
        res.send('Error: User credentials are invalid. <a href="/">Head back to homepage</a>');
    }
});

// Register endpoint
app.get('/register', (req, res) => {
    res.send('<form method="post" action="/register">\
                <input type="text" name="user_ID" placeholder="User ID"><br>\
                <input type="password" name="password" placeholder="Password"><br>\
                <input type="submit" value="Register">\
              </form>');
});

app.post('/register', async (req, res) => {
    const { user_ID, password } = req.body;
    const database = client.db('MyDBexample');
    const users = database.collection('Users');
    await users.insertOne({ user_ID, password });
    res.send('Created user was registered successfully. <a href="/">Head back to homepage</a>');
});

// View Cookies endpoint
app.get('/cookies', (req, res) => {
    res.send(`Active cookies are: ${JSON.stringify(req.cookies)}<br><a href="/">Head back to homepage</a>`);
});

// Clear Cookie endpoint
app.get('/clear-cookie', (req, res) => {
    res.clearCookie('auth');
    res.send('Cookies were cleared successfully. <a href="/">Head back to homepage</a>');
});
