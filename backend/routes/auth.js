const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ✅ Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zip_code: Joi.string().optional(),
  country: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// ✅ Register Route
router.post('/register', async (req, res) => {
  try {
    console.log('👉 Request Body:', req.body);

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.error('❌ Joi Validation Error:', error.details[0].message);
      return res.status(400).json({ message: 'Invalid input' });
    }

    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      address,
      city,
      state,
      zip_code,
      country
    } = value;

    // ✅ Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ Insert user into DB
    const [result] = await pool.execute(
      `INSERT INTO users (email, password, first_name, last_name, phone, address, city, state, zip_code, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        hashedPassword,
        first_name,
        last_name,
        phone ?? null,
        address ?? null,
        city ?? null,
        state ?? null,
        zip_code ?? null,
        country ?? 'USA'
      ]
    );

    const insertId = result.insertId;

    // ✅ Generate JWT
    const token = jwt.sign(
      { userId: insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // ✅ Send response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: insertId,
        email,
        first_name,
        last_name
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    // ✅ Check if user exists
    const [users] = await pool.execute(
      'SELECT id, email, password, first_name, last_name FROM users WHERE email = ?',
      [email]
    );

    console.log("👉 DB Users:", users);

    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password (user not found)' });
    }

    const user = users[0];

    console.log("👉 Plain Password:", password);
    console.log("👉 Hashed Password:", user.password);

    // ✅ Compare hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: 'Invalid email or password (password mismatch)' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Get Current User Route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, email, first_name, last_name, phone, address, city, state, zip_code, country, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;