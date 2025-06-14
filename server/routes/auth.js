// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashed]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, userRes.rows[0].password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: userRes.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1d', });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  } 
});

// Add to routes/auth.js
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "No account with this email found." });
    }

    // For demo purposes, return a mock reset code
    const resetCode = "123456";
    // In production, send an email with this resetCode
    res.json({ message: "Reset code sent to email (mocked).", resetCode });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/update-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashed, email]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
