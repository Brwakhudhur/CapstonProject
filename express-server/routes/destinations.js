
//routes/destination.js
const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Destination = require('../models/destination');

// Route to add a new destination
router.post('/', async (req, res) => {
    const { countryName, details, timeOfYear, activities } = req.body;
    console.log('Received request to add destination:', req.body);

    try {
        const existingDestination = await Destination.findOne({ where: { countryName } });
        if (existingDestination) {
            console.log('Country name already exists:', countryName);
            return res.status(400).json({ message: 'Country name already exists' });
        }

        await Destination.create({ countryName, details, timeOfYear, activities });
        console.log('Destination added successfully:', countryName);
        res.status(200).json({ message: 'Destination added successfully' });
    } catch (error) {
        console.error('Error adding destination:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Route to fetch all destinations
router.get('/', async (req, res) => {
    console.log('Received request to fetch all destinations');
    try {
        const destinations = await Destination.findAll();
        console.log('Fetched destinations:', destinations);
        res.json(destinations);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Route to match destinations based on preferences
router.post('/match-destinations', async (req, res) => {
    const { preferences } = req.body;
    console.log('Received request to match destinations with preferences:', preferences);

    try {
        const matchedDestinations = await Destination.findAll({
            where: {
                activities: {
                    [Op.or]: preferences.map(preference => ({
                        [Op.like]: `%${preference}%`
                    }))
                }
            }
        });

        if (matchedDestinations.length === 0) {
            return res.status(200).json({ message: 'No destinations matched your preferences' });
        }

        console.log('Matched destinations:', matchedDestinations);
        res.json(matchedDestinations);
    } catch (error) {
        console.error('Error matching destinations:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Route to delete a destination by ID
router.delete('/:id', async (req, res) => {
    const destinationId = req.params.id;
    console.log('Received request to delete destination with ID:', destinationId);
    try {
        const destination = await Destination.findByPk(destinationId);

        if (!destination) {
            console.log('Destination not found:', destinationId);
            return res.status(404).json({ message: 'Destination not found' });
        }

        await destination.destroy();
        console.log('Destination deleted successfully:', destinationId);
        res.status(200).json({ message: 'Destination deleted successfully' });
    } catch (error) {
        console.error('Error deleting destination:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Route to update a destination by ID
router.put('/:id', async (req, res) => {
    const destinationId = req.params.id;
    const { countryName, details, timeOfYear, activities } = req.body;
    console.log('Received request to update destination with ID:', destinationId);

    try {
        const destination = await Destination.findByPk(destinationId);

        if (!destination) {
            console.log('Destination not found:', destinationId);
            return res.status(404).json({ message: 'Destination not found' });
        }

        destination.countryName = countryName;
        destination.details = details;
        destination.timeOfYear = timeOfYear;
        destination.activities = activities;

        await destination.save();
        console.log('Destination updated successfully:', destinationId);
        res.status(200).json({ message: 'Destination updated successfully' });
    } catch (error) {
        console.error('Error updating destination:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
