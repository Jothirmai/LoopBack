// routes/directions.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');
require('dotenv').config();

// Helper function to geocode postcode using postcodes.io
async function geocodePostcode(postcode) {
  const cleaned = postcode.replace(/\s+/g, '');
  const res = await axios.get(`https://api.postcodes.io/postcodes/${cleaned}`);
  if (res.data.status !== 200) throw new Error('Invalid postcode');
  return res.data.result; // contains latitude and longitude
}

router.post('/', async (req, res) => {
  const { postcode, userLat, userLon, centerId } = req.body;

  // Check if either postcode or coordinates are provided along with centerId
  if ((!postcode && (userLat === undefined || userLon === undefined)) || !centerId) {
    return res.status(400).json({ error: 'Either postcode or coordinates and centerId are required' });
  }

  try {
    let userLocation;

    if (postcode) {
      // If postcode is provided, convert it to coordinates
      const geo = await geocodePostcode(postcode);
      userLocation = {
        lat: geo.latitude,
        lon: geo.longitude
      };
    } else {
      // Otherwise use lat/lon directly
      userLocation = {
        lat: userLat,
        lon: userLon
      };
    }

    // Fetch center coordinates from database
    const centerRes = await pool.query('SELECT lat, lon, name FROM centers WHERE id = $1', [centerId]);
    if (centerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Center not found' });
    }
    const center = centerRes.rows[0];

    // Request driving directions from OpenRouteService
    const directionsRes = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        coordinates: [
          [userLocation.lon, userLocation.lat], // Start
          [center.lon, center.lat],             // End
        ],
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    // Respond with directions and center info
    res.json({
      center: {
        id: centerId,
        name: center.name,
        lat: center.lat,
        lon: center.lon
      },
      directions: directionsRes.data
    });
  } catch (err) {
    console.error('Directions error:', err.message || err);
    res.status(500).json({ error: 'Failed to get directions' });
  }
});

module.exports = router;
