const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const UserFavorites = require('../models/userFavorites'); // Import UserFavorites
const isAuthenticated = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdminMiddleware');

// Register route (no auth needed)
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = username === 'BRWAKHUDHUR' ? 'admin' : 'user';

        await User.create({ username, password: hashedPassword, email, role });
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route (no auth needed)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            console.error('Login error: Username not registered');
            return res.status(401).json({ message: 'This username is not registered' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.error('Login error: Invalid password');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Store userId and role in the session
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.username = user.username; // Optionally store username

        res.status(200).json({ message: 'Login successful', role: user.role });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to fetch all users (admin only)
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to fetch user info (authenticated users only)
router.get('/userinfo', isAuthenticated, (req, res) => {
    if (req.session && req.session.userId) {
        // Return user info if session is valid
        res.status(200).json({
            userId: req.session.userId,
            username: req.session.username,
            role: req.session.role,
        });
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
});

// Logout route (authenticated users only)
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});

// Delete account route (authenticated users only)
router.delete('/delete-account', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;

    try {
        // First, delete related records in UserFavorites
        await UserFavorites.destroy({ where: { userId } });

        // Now, delete the user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();

        // Destroy the session after deletion
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session after account deletion:', err);
                return res.status(500).json({ message: 'Error destroying session after deletion' });
            }

            res.clearCookie('connect.sid', { path: '/' });
            return res.status(200).json({ message: 'Account deleted successfully' });
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update account route (authenticated users only)
router.put('/update-account', isAuthenticated, async (req, res) => {
    const { currentPassword, username, password } = req.body;
    const userId = req.session.userId;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update username or password if provided
        if (username) {
            user.username = username;
        }
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ message: 'Account updated successfully' });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: Delete user route (admin only)
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await UserFavorites.destroy({ where: { userId: id } }); // Ensure to delete related favorites first
        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin: Update user route (admin only)
router.put('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, email, role } = req.body;

    try {
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username;
        user.email = email;
        user.role = role;

        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
