

const schedule = require('node-schedule');

async function initializeCleanupHit(mongoose) {
  try {
    // // Connect to MongoDB and wait for the connection
    // await require('./mongo_config_Hit').connectDBHit();
    const HitModel = require('../model/hit_model');

    // Schedule cleanup job to run every 30 minutes
    schedule.scheduleJob('*/45 * * * *', async () => {
      try {
       // Check MongoDB connection before running cleanup
        if (mongoose.connection.readyState !== 1) {
          console.warn('⚠️ MongoDB HIT not connected. Attempting to reconnect...');
          await require('../Mongodb_Service/mongo_config_Hit').connectDBHit();
        }
       

        // Cleanup Hits collection to keep only the 10 latest records
        const hitCount = await HitModel.countDocuments();
        if (hitCount > 75) {
          const excessHits = hitCount - 75;
          const latestHits = await HitModel.find({ timestamp: { $exists: true } })
            .sort({ timestamp: -1 })
            .limit(75)
            .select('_id');
          const latestHitIds = latestHits.map(h => h._id);
          await HitModel.deleteMany({ _id: { $nin: latestHitIds } });
          console.log(`Deleted ${excessHits}HITDB: oldest Hits records to maintain 10 latest records`);
        } else {
          console.log('HITDB: No cleanup needed: Hits collection has 10 or fewer records');
        }
      } catch (error) {
        console.error('Error during scheduled cleanup:', error);
      }
    });
    console.log('Cleanup job scheduled to run every 5 minutes to maintain 10 latest records for InformationBroadcast and Hits');
  } catch (error) {
    console.error('Failed to initialize cleanup:', error);
    process.exit(1);
  }
}

module.exports = { initializeCleanupHit };

