// middleware/isAdminMiddleware.js
function isAdmin(req, res, next) {
    if (req.session && req.session.role === 'admin') {
        return next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
}

module.exports = isAdmin;
