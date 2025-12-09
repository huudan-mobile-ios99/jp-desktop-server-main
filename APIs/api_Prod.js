// const express = require('express');
// const router = express.Router();
// const InfoModel = require('./model/information_model');
// const HitModel = require('./model/hit_model');
// const rateLimit = require('express-rate-limit');
// const hit_model = require('./model/hit_model');
// // Utility function for formatting dates (define if not already present)
// const formatDate = () => new Date().toISOString();

// // Middleware for logging
// router.use((req, res, next) => {
//   console.log('API middleware:', req.method, req.url);
//   next();
// });

// // Home route
// router.get('/home', (req, res) => {
//   return res.status(200).json('JP Desktop APIs');
// });

// // API to get HitModel data (JackpotHit and HotSeatHit)
// router.get('/hits', async (req, res) => {
//   try {
//     const { type, limit = 5 } = req.query;
//     const query = type ? { type } : {};
//     const hits = await HitModel.find(query)
//       .sort({ timestamp: -1 }) // Newest first
//       .limit(parseInt(limit))
//       .lean();
//     res.json(hits);
//   } catch (error) {
//     console.error(`[${formatDate()}] Error fetching hits:`, error);
//     res.status(500).json({ error: 'Failed to fetch hits' });
//   }
// });

// // API to get InfoModel data (InformationBroadcast)
// router.get('/broadcasts', async (req, res) => {
//   try {
//     const { jackpotId, limit = 5 } = req.query;
//     const query = jackpotId ? { 'jackpots.jackpotId': jackpotId } : {};
//     const broadcasts = await InfoModel.find(query)
//       .sort({ timestamp: -1 }) // Newest first
//       .limit(parseInt(limit))
//       .lean();
//     res.json(broadcasts);
//   } catch (error) {
//     console.error(`[${formatDate()}] Error fetching broadcasts:`, error);
//     res.status(500).json({ error: 'Failed to fetch broadcasts' });
//   }
// });

// //Use rate limit too
// router.get('/broadcast_latest',rateLimit({
//   windowMs: 5 * 60 * 1000, // 15 minutes
//   max: 1000, // Limit to 100 requests per window
// }), async (req, res) => {
//   try {
//     const { jackpotId } = req.query;
//     const query = jackpotId ? { 'jackpots.jackpotId': jackpotId } : {};
//     const broadcasts = await InfoModel.find(query)
//       .sort({ timestamp: -1 }) // Newest first
//       .limit(1) // Only one item
//       .lean();

//     if (!broadcasts.length) {
//       return res.status(404).json({ error: 'No broadcast found' });
//     }

//     res.json(broadcasts); // Returns array with one item, e.g., [ { ... } ]
//   } catch (error) {
//     console.error(`[${formatDate()}] Error fetching latest broadcast:`, error);
//     res.status(500).json({ error: 'Failed to fetch latest broadcast' });
//   }
// });



// //Latest hit jackpot or hoatseat
// //Use rate limit too
// router.get('/hit_latest',rateLimit({
//   windowMs: 5 * 60 * 1000, // 15 minutes
//   max: 1000, // Limit to 100 requests per window
// }), async (req, res) => {
//   try {
//     const { jackpotId } = req.query;
//     const query = jackpotId ? { 'jackpots.jackpotId': jackpotId } : {};
//     const hits = await HitModel.find(query)
//       .sort({ timestamp: -1 }) // Newest first
//       .limit(1) // Only one item
//       .lean();

//     if (!hits.length) {
//       return res.status(404).json({ error: 'No hits found' });
//     }

//     res.json(hits); // Returns array with one item, e.g., [ { ... } ]
//   } catch (error) {
//     console.error(`[${formatDate()}] Error fetching latest hits:`, error);
//     res.status(500).json({ error: 'Failed to fetch latest hits' });
//   }
// });


// // API to create a new Hit (JackpotHit or HotSeatHit)
// router.post('/create_hit', rateLimit({
//   windowMs: 5 * 60 * 1000,
//   max: 1000,
// }), async (req, res) => {
//   try {
//     const { type, jackpotId, jackpotName, value, machineNumber } = req.body;
//     // Validate required fields
//     if (!type || !['Jackpot', 'HotSeat'].includes(type)) {
//       return res.status(400).json({ error: 'Invalid or missing type. Must be "Jackpot" or "HotSeat"' });
//     }
//     if (!jackpotId) {
//       return res.status(400).json({ error: 'Missing jackpotId' });
//     }
//     if (typeof value !== 'number' || value <= 0) {
//       return res.status(400).json({ error: 'Invalid or missing value. Must be a positive number' });
//     }
//     if (!machineNumber) {
//       return res.status(400).json({ error: 'Missing machineNumber' });
//     }
//     // Create new hit document
//     const hitData = {
//       type,
//       jackpotId,
//       jackpotName: jackpotName || undefined,
//       value,
//       machineNumber,
//       timestamp: new Date(),
//     };

//     // If hitId is in the schema, ensure it's not set manually
//     if ('hitId' in HitModel.schema.paths) {
//       delete hitData.hitId; // Let AutoIncrement handle hitId
//     }
//     const newHit = await HitModel.create(hitData);
//     console.log(`[${formatDate()}] Created new hit:`, newHit._id);
//     res.status(201).json(newHit);
//   } catch (error) {
//     console.error(`[${formatDate()}] Error creating hit:`, error);
//     if (error.name === 'MongoServerError' && error.code === 11000) {
//       return res.status(400).json({ error: 'Duplicate hit entry' });
//     }
//     res.status(500).json({ error: 'Failed to create hit' });
//   }
// });
// module.exports = router; // Export the router
