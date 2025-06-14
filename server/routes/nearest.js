// routes/nearest.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');

router.get('/', async (req, res) => {
  const { postcode } = req.query;

  if (!postcode) {
    return res.status(400).json({ error: 'Postcode is required' });
  }

  try {
    // 1. Geocode the postcode using Postcodes.io
    const geoRes = await axios.get(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    const location = geoRes.data.result;

    if (!location) {
      return res.status(404).json({ error: 'Invalid postcode or not found' });
    }

    const userLat = location.latitude;
    const userLng = location.longitude;

    // 2. Get all recycling centres from DB
    const centersRes = await pool.query('SELECT id, name, postcode, lat, lon FROM centers');
    const centers = centersRes.rows;

    // 3. Calculate Haversine distance
    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadius = 6371; // km

    const withDistance = centers.map((center) => {
      const dLat = toRad(center.lat - userLat);
      const dLon = toRad(center.lon - userLng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(userLat)) * Math.cos(toRad(center.lat)) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = earthRadius * c;
      return { ...center, distance: distance.toFixed(2) };
    });

    // 4. Sort by distance and return top 5
    withDistance.sort((a, b) => a.distance - b.distance);

    res.json(withDistance.slice(0, 5));
  } catch (err) {
    console.error('Nearest center error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
