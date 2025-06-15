const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const redeemRoutes = require('./routes/rewards');
const nearestRoutes = require('./routes/nearest');
const directionsRoutes = require('./routes/directions');
const centerRoutes = require('./routes/centers');

dotenv.config();
const app = express();

// ✅ Remove trailing slash
const allowedOrigins = [
  "http://localhost:3000",
  "https://loopback-fawn.vercel.app",
];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/scan', scanRoutes);
app.use('/rewards', redeemRoutes);
app.use('/nearest', nearestRoutes);
app.use('/directions', directionsRoutes);
app.use('/centers', centerRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('♻️ Recycling Rewards Backend is Running!');
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
