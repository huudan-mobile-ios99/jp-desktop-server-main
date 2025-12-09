const formatDate = () => new Date().toISOString();
// const safeRequire = require('./safe_require');


  const HitModel = require('./model/hit_model');       // JPDesktop_Hit
  const HitModelSub = require('./model/hit_model_sub');// JPDesktop_Hit_Sub
  const HitModel2 = require('./model/hit_model_sub2'); // JPDesktop_Hit_Sub2
  // const HitModel3 = require('./model/hit_model_sub3'); //JPDesktop_Hit_Sub3

function handleHitStream(io) {
  let hitChangeStreamRetries = 0;
  const baseRetryDelay = 5000; // 5 seconds
  let lastEmissionTime = 0; // Timestamp of last emitted hit
  const throttleWindow = 10000; // 10 seconds | Minimum for time jackpot hit

  function watchHitChangeStream(modelLabel, HitModel) {
    if (!HitModel) {
      console.error(`[${formatDate()}] ERROR: HitModel for ${modelLabel} is undefined!`);
      return;
    }
    
    if (!HitModel || typeof HitModel.watch !== 'function') {
    console.error(`[${formatDate()}] ERROR: InfoModel for ${modelLabel} is undefined or invalid! Skipping change stream.`);
    return; // Skip to avoid crash
    }

    console.log(`[${formatDate()}] Starting hit change stream for ${modelLabel}`);
    const hitChangeStream = HitModel.watch(
      [{ $match: { operationType: 'insert' } }],
      { fullDocument: 'updateLookup' }
    );


    hitChangeStreamRetries++;

    hitChangeStream.on('change', async (change) => {
      try {
        if (change.operationType === 'insert' && change.fullDocument?.jackpotId) {
          const latestHit = change.fullDocument;
          console.log(`[${formatDate()}] ${modelLabel} Hit change detected:`, latestHit._id, `jackpotId: ${latestHit.jackpotId}`);

          // Always log when ANY of the three watchers detects new data
          console.log(`[${formatDate()}] ${modelLabel} DETECTED hit:`, {
            id: latestHit._id,
            jackpotId: latestHit.jackpotId,
            source: modelLabel
          });


          const currentTime = Date.now();
          // Emit only if not throttled
          if (currentTime - lastEmissionTime < throttleWindow) {
            console.log(`[${formatDate()}] Throttled (Not emitted) from ${modelLabel}:`, latestHit._id, `(${currentTime - lastEmissionTime}ms since last emit)`);
            return;
          }

          // Emit the hit and update last emission time
          io.emit('hit_latest', latestHit);
          io.to(`jackpot:${latestHit.jackpotId}`).emit('hit_latest', latestHit);
          console.log(`[${formatDate()}] Emitted hit_latest from ${modelLabel} to jackpot:${latestHit.jackpotId}`);

          lastEmissionTime = currentTime; // Update last emission time
        } else {
          console.warn(`[${formatDate()}] Invalid hit change data:`, change);
        }
      } catch (error) {
        console.error(`[${formatDate()}] Error in hit change stream:`, error);
      }
    });

    hitChangeStream.on('error', (error) => {
      console.error(`[${formatDate()}] Hit change stream error:`, error);
      hitChangeStream.close();
      console.log(`[${formatDate()}] Hit change stream closed due to error`);
      const retryDelay = baseRetryDelay * Math.pow(2, hitChangeStreamRetries);
      // console.log(`[${formatDate()}] Retrying hit change stream in ${retryDelay}ms (attempt ${hitChangeStreamRetries})`);
      setTimeout(watchHitChangeStream, retryDelay);
    });

    hitChangeStream.on('close', () => {
      // console.log(`[${formatDate()}] Hit change stream closed`);
      const retryDelay = baseRetryDelay * Math.pow(2, hitChangeStreamRetries);
      console.log(`[${formatDate()}] Retrying hit change stream in ${retryDelay}ms (attempt ${hitChangeStreamRetries})`);
      setTimeout(watchHitChangeStream, retryDelay);
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
    { name: 'HIT_MAIN', model: HitModel },
    { name: 'HIT_SUB', model: HitModelSub },
    { name: 'HIT_SUB2', model: HitModel2 },
  ];

  await Promise.all(
    dbModels.map(async ({ name, model }) => {
      if (await checkModel(model, name)) {
        watchHitChangeStream(name, model);
      } else {
        console.warn(`[${formatDate()}] Skipping ${name} change stream`);
      }
    })
  );
})();
//RUN 4 WATCH CHANGE STREAM AND CHECK LOGIC APPLIED



  // // Periodic logging for debugging
  // setInterval(() => {
  //   console.log(` Hit handler - Hit change stream retries: ${hitChangeStreamRetries}`);
  //    console.log(` Hit handler - Last emission time: ${new Date(lastEmissionTime).toISOString()}`);
  //   if (hitChangeStreamRetries > 10) {
  //     console.error(`[${formatDate()}] Warning: Hit change stream has high retry count (${hitChangeStreamRetries}), consider manual intervention`);
  //     // Add notification logic (e.g., send email or alert)
  //   }
  //   const rooms = io.sockets.adapter.rooms;
  //   console.log(`[${formatDate()}] Hit watchers still active...`);
  //   console.log(`[${formatDate()}] Hit handler - Active rooms:`, Array.from(rooms.keys()).filter(room => room.startsWith('jackpot:')));
  // },5 * 60000 ); //5 minutes to check active room
}

module.exports = { handleHitStream };
