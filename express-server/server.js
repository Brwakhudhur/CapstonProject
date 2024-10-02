const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const { sequelize } = require('./models');
const destinationsRouter = require('./routes/destinations');
const favoritesRouter = require('./routes/favorites');
const isAuthenticated = require('./middleware/authMiddleware');

const app = express();

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    },
  })
);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes that don't require authentication
app.use('/auth', authRoutes);

// Serve protected static files
const protectedPath = path.join(__dirname, '../protected');
console.log('Serving protected static files from:', protectedPath);
app.use('/protected', isAuthenticated, express.static(protectedPath));

// Apply authentication middleware to protected routes
app.use('/favorites', isAuthenticated, favoritesRouter);
app.use('/destinations', isAuthenticated, destinationsRouter);

// Serve the main index page
app.get('/', (req, res) => {
  console.log('Serving Index.html');
  res.sendFile(path.join(__dirname, '../public/Index.html'));
});

// Start the server after database connection is established
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database & tables created!');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database or create tables:', err);
  });


  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});
