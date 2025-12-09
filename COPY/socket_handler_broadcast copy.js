

// const InfoModel = require('./model/information_model');
// const InfoModelAlt = require('./model/information_model_alt');
// const InfoModelSub = require('./model/information_model_sub');
// const InfoModelSub2 = require('./model/information_model_sub2');

// const formatDate = () => new Date().toISOString();

// function handleBroadcastStream(io) {
//   const baseRetryDelay = 5000; // 5 seconds
//   let lastEmissionTime = 0; // Timestamp of last emitted hit
//   const throttleWindow = 20000; // 20 seconds

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


//     const broadcastChangeStream = InfoModel.watch(
//       [{ $match: { operationType: 'insert' } }],
//       { fullDocument: 'updateLookup' },
//     );

//     broadcastChangeStream.on('change', async (change) => {
//       try {
//         if (change.operationType === 'insert' && change.fullDocument) {
//           const latestBroadcast = change.fullDocument;
//           console.log(`[${formatDate()}] ${modelName} Broadcast change detected:`, latestBroadcast._id);

//           // Check throttle window
//           const currentTime = Date.now();
//           if (currentTime - lastEmissionTime < throttleWindow) {
//             // console.log(`[${formatDate()}] Throttling hit emission:`, latestBroadcast._id, `time since last emission: ${currentTime - lastEmissionTime}ms`);
//             return;
//           }

//           io.emit('broadcast_latest', latestBroadcast);
//           console.log(`[${formatDate()}] Emitted broadcast_latest globally:`, latestBroadcast._id);
//           if (Array.isArray(latestBroadcast.jackpots) && latestBroadcast.jackpots.length > 0) {
//             latestBroadcast.jackpots.forEach((jackpot) => {
//               if (jackpot?.jackpotId) {
//                 console.log(`[${formatDate()}] Emitting broadcast_latest to room jackpot:${jackpot.jackpotId}`);
//                 io.to(`jackpot:${jackpot.jackpotId}`).emit('broadcast_latest', latestBroadcast);
//               } else {
//                 console.warn(`[${formatDate()}] Skipping broadcast_latest emission for invalid jackpotId:`, jackpot);
//               }
//             });
//           }
//           console.log(`[${formatDate()}] Emitted latest broadcast:`, latestBroadcast._id);
//           lastEmissionTime = currentTime; // Update last emission time
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
//       setTimeout(watchBroadcastChangeStream, baseRetryDelay);
//     });

//     broadcastChangeStream.on('close', () => {
//       console.log(`[${formatDate()}] Broadcast change stream closed`);
//       setTimeout(watchBroadcastChangeStream, baseRetryDelay);
//     });
//   }


//   // Start watching 3 DBs
//   // watchBroadcastChangeStream('2.ALT_DB ', InfoModelAlt);
//   // watchBroadcastChangeStream('3.SUB_DB ', InfoModelSub);
//   // watchBroadcastChangeStream('4.SUB_DB2 ', InfoModelSub2);
//   // watchBroadcastChangeStream('1.MAIN_DB ', InfoModel);

// async function checkModel(model, name) {
//   try {
//     if (!model || typeof model.watch !== 'function') {
//       throw new Error('Invalid or undefined model');
//     }
//     return true;
//   } catch (err) {
//     console.error(`[${formatDate()}] ❌ ${name} DB connection FAILED: ${err.message}`);
//     return false;
//   }
// }

// (async () => {
//   if (await checkModel(InfoModel, 'MAIN_DB')) {
//     watchBroadcastChangeStream('MAIN_DB', InfoModel);
//   } else {
//     console.warn(`[${formatDate()}] Skipping MAIN_DB change stream`);
//   }

//   if (await checkModel(InfoModelAlt, 'ALT_DB')) {
//     watchBroadcastChangeStream('ALT_DB', InfoModelAlt);
//   } else {
//     console.warn(`[${formatDate()}] Skipping ALT_DB change stream`);
//   }

//   if (await checkModel(InfoModelSub, 'SUB_DB')) {
//     watchBroadcastChangeStream('SUB_DB', InfoModelSub);
//   } else {
//     console.warn(`[${formatDate()}] Skipping SUB_DB change stream`);
//   }

//   if (await checkModel(InfoModelSub2, 'SUB_DB2')) {
//     watchBroadcastChangeStream('SUB_DB2', InfoModelSub2);
//   } else {
//     console.warn(`[${formatDate()}] Skipping SUB_DB2 change stream`);
//   }
// })();


//   setInterval(() => {
//     console.log(`[${formatDate()}] Broadcast handler - Connected clients: ${io.engine.clientsCount}`);
//     const rooms = io.sockets.adapter.rooms;
//     console.log(`[${formatDate()}] Broadcast handler - Active rooms:`, Array.from(rooms.keys()).filter(room => room.startsWith('jackpot:')));
//   }, 60000);
// }

// module.exports = { handleBroadcastStream };
