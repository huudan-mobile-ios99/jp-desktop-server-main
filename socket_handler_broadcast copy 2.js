

// const InfoModel = require('./model/information_model');
// const InfoModelAlt = require('./model/information_model_alt');
// const InfoModelSub = require('./model/information_model_sub');
// const InfoModelSub2 = require('./model/information_model_sub2');
// const IfModel = require('./model/info_model');


// const formatDate = () => new Date().toISOString();
// const baseRetryDelay = 5000; // 5 seconds


// function handleBroadcastStream(io) {
//   const throttleWindow = 20000; // 20 seconds
//   const lastEmissionTimes = {}; // Store per-DB timestamps


//   function watchBroadcastChangeStream(modelName, InfoModel) {
//     console.log(` Starting broadcast change stream for ${modelName}`);
//     if (!InfoModel) {
//       console.error(`[${formatDate()}] ERROR: InfoModel for ${modelName} is undefined!`);
//       return;
//     }
//     if (!InfoModel || typeof InfoModel.watch !== 'function') {
//     console.error(`[${formatDate()}] ERROR: InfoModel for ${modelName} is undefined or invalid! Skipping change stream.`);
//     return; // Skip to avoid crash
//     }

//     const restart = () => {
//       console.log(`[${formatDate()}] Restarting change stream for ${modelName} in ${baseRetryDelay}ms`);
//       setTimeout(() => watchBroadcastChangeStream(modelName, InfoModel), baseRetryDelay);
//     };


//     const broadcastChangeStream = InfoModel.watch(
//       [{ $match: { operationType: 'insert' } }],
//       { fullDocument: 'updateLookup' },
//     );

//     broadcastChangeStream.on('change', async (change) => {
//        try {
//         if (change.operationType === 'insert' && change.fullDocument) {
//           const latestBroadcast = change.fullDocument;
//           console.log(`[${formatDate()}] ${modelName} Broadcast change detected`);
//           const currentTime = Date.now();
//           if (lastEmissionTimes[modelName] && currentTime - lastEmissionTimes[modelName] < throttleWindow) {
//             return; // Throttled for this DB
//           }

//           io.emit('broadcast_latest', latestBroadcast);
//           // console.log(`[${formatDate()}] Emitted broadcast_latest globally`);

//           if (Array.isArray(latestBroadcast.jackpots) && latestBroadcast.jackpots.length > 0) {
//             latestBroadcast.jackpots.forEach((jackpot) => {
//               if (jackpot?.jackpotId) {
//                 io.to(`jackpot:${jackpot.jackpotId}`).emit('broadcast_latest', latestBroadcast);
//               } else {
//                 console.warn(`[${formatDate()}] Skipping invalid jackpotId:`, jackpot);
//               }
//             });
//           }

//           // console.log(`[${formatDate()}] Emitted latest broadcast:`, latestBroadcast._id);
//           lastEmissionTimes[modelName] = currentTime;
//         } else {
//           console.warn(`[${formatDate()}] Invalid broadcast change data:`, change);
//         }
//       } catch (error) {
//         console.error(`[${formatDate()}] Error in broadcast change stream:`, error);
//       }
//     });

//     broadcastChangeStream.on('error', (error) => {
//       console.error(`[${formatDate()}] Broadcast change stream error:`, error);
//       broadcastChangeStream.close();
//       console.log(`[${formatDate()}] Broadcast change stream closed due to error`);
//       restart();
//     });

//     broadcastChangeStream.on('close', () => {
//       console.log(`[${formatDate()}] Broadcast change stream closed`);
//       restart();
//     });
//   }


// //START CHECK MODEL
// async function checkModel(model, name) {
//   try {
//     if (!model || typeof model.watch !== 'function') {
//       throw new Error(`Invalid or undefined model for ${name}`);
//     }
//     // Ensure Mongoose connection is ready
//     if (model.db.readyState !== 1) { // 1 = connected
//       console.warn(`[${formatDate()}] Waiting for ${name} DB connection...`);
//       await new Promise((resolve, reject) => {
//         const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
//         model.db.once('connected', () => {
//           clearTimeout(timeout);
//           resolve();
//         });
//       });
//     }
//     if (!model.db || !model.db.db) {
//       throw new Error(`${name} model is not bound to a valid database`);
//     }
//     // Ping database to make sure the connection is alive
//     await model.db.db.command({ ping: 1 });
//     console.log(`[${formatDate()}] ✅ ${name} DB connection OK`);
//     return true;

//   } catch (err) {
//     console.error(`[${formatDate()}] ❌ ${name} DB connection FAILED: ${err.message}`);
//     return false;
//   }
// }




// async function ensureWatch(modelName, model) {
//   if (await checkModel(model, modelName)) {
//     watchBroadcastChangeStream(modelName, model);
//   } else {
//     console.warn(`[${formatDate()}] ${modelName} not ready, retrying in 5s...`);
//     setTimeout(() => ensureWatch(modelName, model), 5000);
//   }
// }

// (async () => {
//   const dbModels = [
//     { name: '1.ALT_DB', model: InfoModelAlt },
//      { name: '3.SUB_DB', model: InfoModelSub },
//      { name: '2.MAIN_DB', model: InfoModel },
//     { name: '4.SUB_DB2', model: InfoModelSub2 },
//     { name: '5.SUB_DB3', model: IfModel },
   
//   ];

//   dbModels.forEach(({ name, model }) => ensureWatch(name, model));
// })();
// //RUN 4 WATCH CHANGE STREAM AND CHECK LOGIC APPLIED



// // setInterval(() => {
// //     console.log(`[${formatDate()}] Broadcast handler - Connected clients: ${io.engine.clientsCount}`);
// //     const rooms = io.sockets.adapter.rooms;
// //     console.log(`[${formatDate()}] Broadcast handler - Active rooms:`, Array.from(rooms.keys()).filter(room => room.startsWith('jackpot:')));
// //   }, 5*60000);

// }

// module.exports = { handleBroadcastStream };
