const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();
const SALT_ROUNDS = 12;
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function issueToken(res, user) {
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: TOKEN_MAX_AGE_MS,
    });
}

router.post('/signup',
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

        const { email, password } = req.body;
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) return res.status(409).json({ error: 'An account with that email already exists' });

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash);
        const user = { id: result.lastInsertRowid, email };

        issueToken(res, user);
        res.status(201).json({ user });
    });

router.post('/login',
    body('email').isEmail().withMessage('Invalid email or password').normalizeEmail(),
    body('password').notEmpty().withMessage('Invalid email or password'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid email or password' });

        const { email, password } = req.body;
        const row = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email);
        if (!row) return res.status(401).json({ error: 'Invalid email or password' });

        const valid = await bcrypt.compare(password, row.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

        const user = { id: row.id, email: row.email };
        issueToken(res, user);
        res.json({ user });
    });

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: req.user });
});

module.exports = router;
