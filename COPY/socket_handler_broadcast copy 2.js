

const InfoModel = require('../model/information_model');
const InfoModelAlt = require('../model/information_model_alt');
const InfoModelSub = require('../model/information_model_sub');
const InfoModelSub2 = require('../model/information_model_sub2');

const formatDate = () => new Date().toISOString();

function handleBroadcastStream(io) {
  const baseRetryDelay = 5000; // 5 seconds
  let lastEmissionTime = 0; // Timestamp of last emitted hit
  const throttleWindow = 20000; // 20 seconds

  function watchBroadcastChangeStream(modelName, InfoModel) {
    console.log(` Starting broadcast change stream for ${modelName}`);
    if (!InfoModel) {
      console.error(`[${formatDate()}] ERROR: InfoModel for ${modelName} is undefined!`);
      return;
    }
    if (!InfoModel || typeof InfoModel.watch !== 'function') {
    console.error(`[${formatDate()}] ERROR: InfoModel for ${modelName} is undefined or invalid! Skipping change stream.`);
    return; // Skip to avoid crash
    }


    const broadcastChangeStream = InfoModel.watch(
      [{ $match: { operationType: 'insert' } }],
      { fullDocument: 'updateLookup' },
    );

    broadcastChangeStream.on('change', async (change) => {
      try {
        if (change.operationType === 'insert' && change.fullDocument) {
          const latestBroadcast = change.fullDocument;
          console.log(`[${formatDate()}] ${modelName} Broadcast change detected:`);

          // Check throttle window
          const currentTime = Date.now();
          if (currentTime - lastEmissionTime < throttleWindow) {
            // console.log(`[${formatDate()}] Throttling hit emission:`, latestBroadcast._id, `time since last emission: ${currentTime - lastEmissionTime}ms`);
            return;
          }

          io.emit('broadcast_latest', latestBroadcast);
          console.log(`[${formatDate()}] Emitted broadcast_latest globally:`, );
          if (Array.isArray(latestBroadcast.jackpots) && latestBroadcast.jackpots.length > 0) {
            latestBroadcast.jackpots.forEach((jackpot) => {
              if (jackpot?.jackpotId) {
                // console.log(`[${formatDate()}] Emitting broadcast_latest to room jackpot:${jackpot.jackpotId}`);
                io.to(`jackpot:${jackpot.jackpotId}`).emit('broadcast_latest', latestBroadcast);
              } else {
                console.warn(`[${formatDate()}] Skipping broadcast_latest emission for invalid jackpotId:`, jackpot);
              }
            });
          }
          console.log(`[${formatDate()}] Emitted latest broadcast:`, latestBroadcast._id);
          lastEmissionTime = currentTime; // Update last emission time
        } else {
          console.warn(`[${formatDate()}] Invalid broadcast change data:`, change);
        }
      } catch (error) {
        console.error(`[${formatDate()}] Error in broadcast change stream:`, error);
      }
    });

    broadcastChangeStream.on('error', (error) => {
      console.error(`[${formatDate()}] Broadcast change stream error:`, error);
      broadcastChangeStream.close();
      console.log(`[${formatDate()}] Broadcast change stream closed due to error`);
      setTimeout(watchBroadcastChangeStream, baseRetryDelay);
    });

    broadcastChangeStream.on('close', () => {
      console.log(`[${formatDate()}] Broadcast change stream closed`);
      setTimeout(watchBroadcastChangeStream, baseRetryDelay);
    });
  }


//START CHECK MODEL
async function checkModel(model, name) {
  try {
    if (!model || typeof model.watch !== 'function') {
      throw new Error(`Invalid or undefined model for ${name}`);
    }
    // Ensure Mongoose connection is ready
    if (model.db.readyState !== 1) { // 1 = connected
      console.warn(`[${formatDate()}] Waiting for ${name} DB connection...`);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
        model.db.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
    if (!model.db || !model.db.db) {
      throw new Error(`${name} model is not bound to a valid database`);
    }
    // Ping database to make sure the connection is alive
    await model.db.db.command({ ping: 1 });
    console.log(`[${formatDate()}] ✅ ${name} DB connection OK`);
    return true;

  } catch (err) {
    console.error(`[${formatDate()}] ❌ ${name} DB connection FAILED: ${err.message}`);
    return false;
  }
}

//END CHECK MODEL 
(async () => {
  const dbModels = [
    { name: 'ALT_DB', model: InfoModelAlt },
    { name: 'MAIN_DB', model: InfoModel },

    { name: 'SUB_DB', model: InfoModelSub },
    { name: 'SUB_DB2', model: InfoModelSub2 },
  ];

  await Promise.all(
    dbModels.map(async ({ name, model }) => {
      if (await checkModel(model, name)) {
        watchBroadcastChangeStream(name, model);
      } else {
        console.warn(`[${formatDate()}] Skipping ${name} change stream`);
      }
    })
  );
})();
//RUN 4 WATCH CHANGE STREAM AND CHECK LOGIC APPLIED



setInterval(() => {
    console.log(`[${formatDate()}] Broadcast handler - Connected clients: ${io.engine.clientsCount}`);
    const rooms = io.sockets.adapter.rooms;
    console.log(`[${formatDate()}] Broadcast handler - Active rooms:`, Array.from(rooms.keys()).filter(room => room.startsWith('jackpot:')));
  }, 60000);
}

module.exports = { handleBroadcastStream };
