// middleware/authMiddleware.js

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    } else {
      // Check if the request expects HTML
      if (req.accepts('html')) {
        res.redirect('/'); // Redirect to login page
      } else {
        // For AJAX or other requests, send a 401 Unauthorized response
        res.status(401).json({ message: 'User not authenticated' });
      }
    }
  }
  
  module.exports = isAuthenticated;
  