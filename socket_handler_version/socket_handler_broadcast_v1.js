// const InfoModel = require('./model/information_model');
// const formatDate = () => new Date().toISOString();

// function handleBroadcastStream(io) {
//   const baseRetryDelay = 5000; // 5 seconds
//   let lastEmissionTime = 0; // Timestamp of last emitted hit
//   const throttleWindow = 15000; // 10 seconds

//   function watchBroadcastChangeStream() {
//     console.log(`[${formatDate()}] Starting broadcast change stream`);
//     const broadcastChangeStream = InfoModel.watch(
//       [{ $match: { operationType: 'insert' } }],
//       { fullDocument: 'updateLookup' }
//     );

//     broadcastChangeStream.on('change', async (change) => {
//       try {
//         if (change.operationType === 'insert' && change.fullDocument) {
//           const latestBroadcast = change.fullDocument;
//           console.log(`[${formatDate()}] Broadcast change detected:`, latestBroadcast._id);
//            // Check throttle window
//           const currentTime = Date.now();
//           if (currentTime - lastEmissionTime < throttleWindow) {
//             console.log(`[${formatDate()}] Throttling hit emission:`, latestHit._id, `time since last emission: ${currentTime - lastEmissionTime}ms`);
//             return;
//           }

//           io.emit('broadcast_latest', latestBroadcast);
//           console.log(`[${formatDate()}] Emitted broadcast_latest globally:`, latestBroadcast._id);
//           if (Array.isArray(latestBroadcast.jackpots) && latestBroadcast.jackpots.length > 0) {
//             latestBroadcast.jackpots.forEach((jackpot) => {
//               if (jackpot?.jackpotId) {
//                 // console.log(`[${formatDate()}] Emitting broadcast_latest to room jackpot:${jackpot.jackpotId}`);
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

//   watchBroadcastChangeStream();

//   setInterval(() => {
//     console.log(`[${formatDate()}] Broadcast handler - Connected clients: ${io.engine.clientsCount}`);
//     const rooms = io.sockets.adapter.rooms;
//     console.log(`[${formatDate()}] Broadcast handler - Active rooms:`, Array.from(rooms.keys()).filter(room => room.startsWith('jackpot:')));
//   }, 60000);
// }

// module.exports = { handleBroadcastStream };
