const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (typeof email !== 'string' || typeof password !== 'string'){
            return res.status(400).strictContentLength({ error: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail.length > 255 || !EMAIL_REGEX.test(normalizedEmail)){
            return res.status(400).json({ error: 'Please provide a vailid email address'});
        }

        if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({ error: 'Passowrd must be at least 8 characters and at most 72 bytes' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO users (email, password_hash) 
            VALUES ($1, $2) 
            RETURNING id, email, created_at` ,
            [normalizedEmail, passwordHash]
        );

        res.status(201).json({ user: result.rows[0] })
    } catch (err) {
        if(err.code === '23505'){
            return res.status(409).json({ error: 'An account with that email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || { }

        if(typeof email !== 'string' || typeof password !== 'string'){
            return res.status(400).json({ error: 'Email and password are required'});
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = await pool.query(
            `SELECT id, email, password_hash FROM users WHERE email = $1`,
            [normalizedEmail]
        );

        const user = result.rows[0];
        if(!user){
            return res.status(401).json({ error: 'Invalid email or password'});
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if(!passwordMatches){
            return res.status(401).json({ error: 'Invalid email or password'});
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        );

        res.json({
            token,
            user: { id: user.id, email: user.email},
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong'});
    }
});

module.exports = router;