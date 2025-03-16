const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB Cloud using the connection string from the .env file.
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a simple User Schema with email and password.
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Register endpoint: accepts email and password, hashes the password, and saves the user.
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    // Check if the user already exists.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
  
    // Hash the password before saving.
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    return res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error in /register:", error);
    return res.status(500).json({ message: 'Error registering user', error });
  }
});

// Get all users endpoint.
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});
// Home route: serve an HTML page with a button that shows an alert when clicked.
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Connected Message</title>
      </head>
      <body>
        <h1>hiii connected</h1>
      </body>
    </html>
  `);
});


// Start the server.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
