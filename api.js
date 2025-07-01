const express = require('express');
const router = express.Router();
const InfoModel = require('./model/information_model');
const HitModel = require('./model/hit_model');
const rateLimit = require('express-rate-limit');
// Utility function for formatting dates (define if not already present)
const formatDate = () => new Date().toISOString();

// Middleware for logging
router.use((req, res, next) => {
  console.log('API middleware:', req.method, req.url);
  next();
});

// Home route
router.get('/home', (req, res) => {
  return res.status(200).json('JP Desktop APIs');
});

// API to get HitModel data (JackpotHit and HotSeatHit)
router.get('/hits', async (req, res) => {
  try {
    const { type, limit = 5 } = req.query;
    const query = type ? { type } : {};
    const hits = await HitModel.find(query)
      .sort({ timestamp: -1 }) // Newest first
      .limit(parseInt(limit))
      .lean();
    res.json(hits);
  } catch (error) {
    console.error(`[${formatDate()}] Error fetching hits:`, error);
    res.status(500).json({ error: 'Failed to fetch hits' });
  }
});

// API to get InfoModel data (InformationBroadcast)
router.get('/broadcasts', async (req, res) => {
  try {
    const { jackpotId, limit = 5 } = req.query;
    const query = jackpotId ? { 'jackpots.jackpotId': jackpotId } : {};
    const broadcasts = await InfoModel.find(query)
      .sort({ timestamp: -1 }) // Newest first
      .limit(parseInt(limit))
      .lean();
    res.json(broadcasts);
  } catch (error) {
    console.error(`[${formatDate()}] Error fetching broadcasts:`, error);
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

//Use rate limit too
router.get('/broadcast_latest',rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 1000, // Limit to 100 requests per window
}), async (req, res) => {
  try {
    const { jackpotId } = req.query;
    const query = jackpotId ? { 'jackpots.jackpotId': jackpotId } : {};
    const broadcasts = await InfoModel.find(query)
      .sort({ timestamp: -1 }) // Newest first
      .limit(1) // Only one item
      .lean();

    if (!broadcasts.length) {
      return res.status(404).json({ error: 'No broadcast found' });
    }

    res.json(broadcasts); // Returns array with one item, e.g., [ { ... } ]
  } catch (error) {
    console.error(`[${formatDate()}] Error fetching latest broadcast:`, error);
    res.status(500).json({ error: 'Failed to fetch latest broadcast' });
  }
})

module.exports = router; // Export the router
