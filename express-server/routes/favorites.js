// routes/favorites.js

const express = require('express');
const router = express.Router();
const { UserFavorites, Destination } = require('../models');

// Route to get user's favorite destinations
router.get('/', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    console.error('User not authenticated');
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const favorites = await UserFavorites.findAll({
      where: { userId },
      include: [Destination],
    });
    const favoriteDestinations = favorites.map((fav) => fav.Destination);
    res.json(favoriteDestinations);
  } catch (error) {
    console.error('Error fetching favorite destinations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to mark a destination as favorite
router.post('/:destinationId', async (req, res) => {
  const userId = req.session.userId;
  const { destinationId } = req.params;

  if (!userId || !destinationId) {
    console.error('Missing userId or destinationId');
    return res.status(400).json({ message: 'Missing userId or destinationId' });
  }

  try {
    const parsedDestinationId = parseInt(destinationId);
    if (isNaN(parsedDestinationId)) {
      return res.status(400).json({ message: 'Invalid destinationId format' });
    }

    const [favorite, created] = await UserFavorites.findOrCreate({
      where: { userId, destinationId: parsedDestinationId },
    });

    if (created) {
      res.status(200).json({ message: 'Destination favorited successfully' });
    } else {
      res.status(400).json({ message: 'Destination is already favorited' });
    }
  } catch (error) {
    console.error('Error favoriting destination:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to unfavorite a destination
router.delete('/:destinationId', async (req, res) => {
  const userId = req.session.userId;
  const { destinationId } = req.params;

  if (!userId || !destinationId) {
    console.error('Missing userId or destinationId');
    return res.status(400).json({ message: 'Missing userId or destinationId' });
  }

  try {
    const parsedDestinationId = parseInt(destinationId);
    if (isNaN(parsedDestinationId)) {
      return res.status(400).json({ message: 'Invalid destinationId format' });
    }

    const result = await UserFavorites.destroy({
      where: {
        userId,
        destinationId: parsedDestinationId,
      },
    });

    if (result) {
      res.status(200).json({ message: 'Destination unfavorited successfully' });
    } else {
      res.status(404).json({ message: 'Favorite not found' });
    }
  } catch (error) {
    console.error('Error unfavoriting destination:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export the router
module.exports = router;
