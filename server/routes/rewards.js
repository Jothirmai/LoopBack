const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// POST /reward - Redeem a reward and return updated points
router.post('/', authenticateToken, async (req, res) => {
  const { rewardId } = req.body;
  const userId = req.user.userId;

  try {
    // 1. Get the reward
    const rewardRes = await pool.query('SELECT * FROM rewards WHERE id = $1', [rewardId]);
    if (rewardRes.rows.length === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    const reward = rewardRes.rows[0];

    // 2. Check user's current points
    const userRes = await pool.query('SELECT points FROM users WHERE id = $1', [userId]);
    const currentPoints = userRes.rows[0].points;

    if (currentPoints < reward.cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // 3. Deduct reward cost from user points
    await pool.query('UPDATE users SET points = points - $1 WHERE id = $2', [reward.cost, userId]);

    // 4. Log redemption
    await pool.query(
      'INSERT INTO redemptions (user_id, reward_id, redeemed_at) VALUES ($1, $2, NOW())',
      [userId, rewardId]
    );

    // 5. Insert into user_points_log
    await pool.query(
      `INSERT INTO user_points_log (user_id, points, type, description)
       VALUES ($1, $2, 'redeem', $3)`,
      [userId, -reward.cost, `Redeemed ${reward.name}`]
    );

    // 6. Get updated points
    const updatedPointsRes = await pool.query('SELECT points FROM users WHERE id = $1', [userId]);
    const updatedPoints = updatedPointsRes.rows[0].points;

    // 7. Return success with updated points
    res.json({
      message: 'Reward redeemed successfully',
      currentPoints: updatedPoints,
    });
  } catch (err) {
    console.error('Redeem error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /rewards/a - Fetch all rewards
router.get('/a', async (req, res) => {
  try {
    const rewards = await pool.query(`SELECT * FROM rewards`);
    res.json(rewards.rows);
  } catch (err) {
    console.error('Fetch rewards error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /rewards - Get reward history and current balance
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const historyRes = await pool.query(`
      SELECT points, type, description, created_at
      FROM user_points_log
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    const balanceRes = await pool.query(`
      SELECT points AS current_balance
      FROM users
      WHERE id = $1
    `, [userId]);

    res.json({
      history: historyRes.rows,
      currentPoints: balanceRes.rows[0].current_balance
    });
  } catch (err) {
    console.error('Reward history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
