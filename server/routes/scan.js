// routes/scan.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your PostgreSQL connection pool
const authenticateToken = require('../middleware/auth'); // Your authentication middleware

// Haversine formula to calculate distance between two lat/lon points in meters
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
}

router.post('/', authenticateToken, async (req, res) => {
  const { qrCode, userLat, userLon } = req.body;
  const userId = req.user.userId; // Extracted from JWT by authenticateToken middleware

  if (!qrCode || typeof userLat === 'undefined' || typeof userLon === 'undefined') {
    return res.status(400).json({ error: 'QR code and user location (latitude, longitude) are required.' });
  }

  try {
    // 1. Find center by QR code
    const centerRes = await pool.query('SELECT id, name, lat, lon FROM centers WHERE qr_id = $1', [qrCode]);
    if (centerRes.rows.length === 0) {
      console.log(`Scan error for user ${userId}: Center not found for QR code: ${qrCode}`);
      return res.status(404).json({ error: 'Invalid QR code. Center not found.' });
    }
    const center = centerRes.rows[0];

    // 2. Check distance: user must be within 100 meters of the center
    const distance = haversineDistance(userLat, userLon, center.lat, center.lon);
    const maxDistance = 100; // 100 meters
    if (distance > maxDistance) {
      console.log(`Scan error for user ${userId} at center ${center.id}: Too far (${distance.toFixed(2)}m > ${maxDistance}m)`);
      return res.status(400).json({ error: `You are too far from the recycling center (${distance.toFixed(0)}m). Please get closer.` });
    }

    // 3. Check cooldown: User must not have scanned this QR code within the last 30 minutes
    const cooldownPeriodSeconds = 30 * 60; // 30 minutes in seconds
    const lastVisitRes = await pool.query(
      'SELECT visited_at FROM visits WHERE user_id = $1 AND center_id = $2 ORDER BY visited_at DESC LIMIT 1',
      [userId, center.id]
    );

    const now = new Date();
    if (lastVisitRes.rows.length > 0) {
      const lastVisitedAt = new Date(lastVisitRes.rows[0].visited_at);
      const timeElapsedSeconds = (now.getTime() - lastVisitedAt.getTime()) / 1000;

      if (timeElapsedSeconds < cooldownPeriodSeconds) {
        const remainingTimeSeconds = cooldownPeriodSeconds - timeElapsedSeconds;
        const minutes = Math.ceil(remainingTimeSeconds / 60);
        console.log(`Scan error for user ${userId} at center ${center.id}: Cooldown active. ${minutes} min remaining.`);
        return res.status(429).json({ error: `You have already scanned this center recently. Please try again in ${minutes} minutes.` });
      }
    }

    // 4. Record the visit
    await pool.query(
      'INSERT INTO visits (user_id, center_id, visited_at) VALUES ($1, $2, $3)',
      [userId, center.id, now]
    );

    // 5. Award 10 points to the user
    const pointsAwarded = 10;
    await pool.query('UPDATE users SET points = points + $1 WHERE id = $2', [pointsAwarded, userId]);

    // 6. Log this in user_points_log table
    await pool.query(
      `INSERT INTO user_points_log (user_id, points, type, description) VALUES ($1, $2, 'earn', $3)`,
      [userId, pointsAwarded, `QR Scan at ${center.name}`]
    );

    console.log(`User ${userId} successfully scanned QR at ${center.name} (Center ID: ${center.id}). Awarded ${pointsAwarded} points.`);
    res.json({ message: `Success! You earned ${pointsAwarded} points for recycling at ${center.name}.` });

  } catch (err) {
    console.error('Server error during scan:', err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

module.exports = router;
