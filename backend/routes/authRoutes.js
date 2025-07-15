const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    console.log('........resgister.........')
    const { name, email, password, role } = req.body;
    console.log(req.body)
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role_name = await User.getRoleByName(role);
        console.log('role', role)
        
        if (!role_name) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        const role_id = role_name.id;

        const userId = await User.create(name, email, hashedPassword, role_id);
        res.status(201).json({ message: 'User registered successfully', userId: userId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign(
            { id: user.id, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, role: user.role_name },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ accessToken, refreshToken, id: user.id, role: user.role_name, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Refresh token
router.post('/token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh Token Required' });
    }

    try {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new Error('REFRESH_TOKEN_SECRET is not defined');
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired Refresh Token' });
            }

            const accessToken = jwt.sign(
                { id: decoded.id, role: decoded.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ accessToken });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
