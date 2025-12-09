// const InfoModel = require('./model/information_model');
// const HitModel = require('./model/hit_model');

// // Utility function for formatting dates
// const formatDate = () => new Date().toISOString();

// // Handle Socket.IO connections and change streams
// function handleSocketIO(io) {
//   // Watch for changes in the InformationBroadcast collection
//   const broadcastChangeStream = InfoModel.watch([
//     { $match: { operationType: 'insert' } } // Only listen for insert operations
//   ], { fullDocument: 'updateLookup' });

//   // Handle InformationBroadcast change stream events
//   broadcastChangeStream.on('change', async (change) => {
//     try {
//       if (change.operationType === 'insert') {
//         const latestBroadcast = change.fullDocument;
//         // Emit to all connected clients
//         io.emit('broadcast_latest', latestBroadcast);
//         // Optionally, emit to clients filtered by jackpotId
//         if (latestBroadcast.jackpots && latestBroadcast.jackpots.length > 0) {
//           latestBroadcast.jackpots.forEach((jackpot) => {
//             io.to(`jackpot:${jackpot.jackpotId}`).emit('broadcast_latest', latestBroadcast);
//           });
//         }
//         console.log(`[${formatDate()}] Emitted latest broadcast:`, latestBroadcast._id);
//       }
//     } catch (error) {
//       console.error(`[${formatDate()}] Error in broadcast change stream:`, error);
//     }
//   });

//   // Handle broadcast change stream errors
//   broadcastChangeStream.on('error', (error) => {
//     console.error(`[${formatDate()}] Broadcast change stream error:`, error);
//     broadcastChangeStream.close();
//     console.log(`[${formatDate()}] Broadcast change stream closed due to error`);
//   });

//   // Watch for changes in the Hits collection
//   const hitChangeStream = HitModel.watch([
//     { $match: { operationType: 'insert' } } // Only listen for insert operations
//   ], { fullDocument: 'updateLookup' });

//   // Handle Hits change stream events
//   hitChangeStream.on('change', async (change) => {
//     try {
//       if (change.operationType === 'insert') {
//         const latestHit = change.fullDocument;
//         // Emit to all connected clients
//         io.emit('hit_latest', latestHit);
//         // Emit to clients filtered by jackpotId
//         io.to(`jackpot:${latestHit.jackpotId}`).emit('hit_latest', latestHit);
//         console.log(`[${formatDate()}] Emitted latest hit:`, latestHit._id);
//       }
//     } catch (error) {
//       console.error(`[${formatDate()}] Error in hit change stream:`, error);
//     }
//   });

//   // Handle hit change stream errors
//   hitChangeStream.on('error', (error) => {
//     console.error(`[${formatDate()}] Hit change stream error:`, error);
//     hitChangeStream.close();
//     console.log(`[${formatDate()}] Hit change stream closed due to error`);
//   });

//   // Handle Socket.IO connections
//   io.on('connection', (socket) => {
//     console.log(`[${formatDate()}] Client connected: ${socket.id}`);

//     // Allow clients to subscribe to specific jackpotId updates for broadcasts and hits
//     socket.on('subscribe_jackpot', (jackpotId) => {
//       if (typeof jackpotId === 'string' && jackpotId) {
//         socket.join(`jackpot:${jackpotId}`);
//         console.log(`[${formatDate()}] Client ${socket.id} subscribed to jackpotId: ${jackpotId}`);
//       }
//     });

//     // Handle client disconnection
//     socket.on('disconnect', () => {
//       console.log(`[${formatDate()}] Client disconnected: ${socket.id}`);
//     });
//   });
// }

// module.exports = { handleSocketIO };



































const InfoModel = require('./model/information_model');
const HitModel = require('./model/hit_model');

const formatDate = () => new Date().toISOString();

function handleSocketIO(io) {
  let hitChangeStreamRetries = 0;
  const maxRetries = 10;
  const baseRetryDelay = 5000; // 5 seconds

  function watchBroadcastChangeStream() {
    console.log(`[${formatDate()}] Starting broadcast change stream`);
    const broadcastChangeStream = InfoModel.watch(
      [{ $match: { operationType: 'insert' } }],
      { fullDocument: 'updateLookup' }
    );

    broadcastChangeStream.on('change', async (change) => {
      try {
        if (change.operationType === 'insert' && change.fullDocument) {
          const latestBroadcast = change.fullDocument;
          console.log(`[${formatDate()}] Broadcast change detected:`, latestBroadcast._id);
          io.emit('broadcast_latest', latestBroadcast);
          if (Array.isArray(latestBroadcast.jackpots) && latestBroadcast.jackpots.length > 0) {
            latestBroadcast.jackpots.forEach((jackpot) => {
              if (jackpot?.jackpotId) {
                console.log(`[${formatDate()}] Emitting broadcast_latest to room jackpot:${jackpot.jackpotId}`);
                io.to(`jackpot:${jackpot.jackpotId}`).emit('broadcast_latest', latestBroadcast);
              } else {
                console.warn(`[${formatDate()}] Skipping broadcast_latest emission for invalid jackpotId:`, jackpot);
              }
            });
          }
          console.log(`[${formatDate()}] Emitted latest broadcast:`, latestBroadcast._id);
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

  function watchHitChangeStream() {
    if (hitChangeStreamRetries >= maxRetries) {
      console.error(`[${formatDate()}] Hit change stream reached max retries (${maxRetries}), stopping`);
      return;
    }

    console.log(`[${formatDate()}] Starting hit change stream (attempt ${hitChangeStreamRetries + 1}/${maxRetries})`);
    const hitChangeStream = HitModel.watch(
      [{ $match: { operationType: 'insert' } }],
      { fullDocument: 'updateLookup' }
    );

    hitChangeStreamRetries++;

    hitChangeStream.on('change', async (change) => {
      try {
        if (change.operationType === 'insert' && change.fullDocument?.jackpotId) {
          const latestHit = change.fullDocument;
          console.log(`[${formatDate()}] Hit change detected:`, latestHit._id, `jackpotId: ${latestHit.jackpotId}`);
          io.emit('hit_latest', latestHit);
          console.log(`[${formatDate()}] Emitted hit_latest globally:`, latestHit._id);
          io.to(`jackpot:${latestHit.jackpotId}`).emit('hit_latest', latestHit);
          console.log(`[${formatDate()}] Emitted hit_latest to room jackpot:${latestHit.jackpotId}`);
          hitChangeStreamRetries = 0; // Reset retries on successful change
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
      console.log(`[${formatDate()}] Retrying hit change stream in ${retryDelay}ms (attempt ${hitChangeStreamRetries}/${maxRetries})`);
      setTimeout(watchHitChangeStream, retryDelay);
    });

    hitChangeStream.on('close', () => {
      console.log(`[${formatDate()}] Hit change stream closed`);
      const retryDelay = baseRetryDelay * Math.pow(2, hitChangeStreamRetries);
      console.log(`[${formatDate()}] Retrying hit change stream in ${retryDelay}ms (attempt ${hitChangeStreamRetries}/${maxRetries})`);
      setTimeout(watchHitChangeStream, retryDelay);
    });
  }

  watchBroadcastChangeStream();
  watchHitChangeStream();

  io.on('connection', (socket) => {
    console.log(`[${formatDate()}] Client connected: ${socket.id}`);
    // Log current rooms for debugging
    console.log(`[${formatDate()}] Client ${socket.id} rooms:`, Object.keys(socket.rooms));

    socket.on('subscribe_jackpot', (jackpotId) => {
      if (typeof jackpotId === 'string' && jackpotId.trim() !== '') {
        socket.join(`jackpot:${jackpotId}`);
        console.log(`[${formatDate()}] Client ${socket.id} subscribed to jackpotId: ${jackpotId}`);
        console.log(`[${formatDate()}] Client ${socket.id} updated rooms:`, Object.keys(socket.rooms));
      } else {
        console.warn(`[${formatDate()}] Invalid jackpotId received from client ${socket.id}:`, jackpotId);
        socket.emit('error', { message: 'Invalid jackpotId' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[${formatDate()}] Client disconnected: ${socket.id}`);
    });
  });

  // Periodic logging for debugging
  setInterval(() => {
    console.log(`[${formatDate()}] Connected clients: ${io.engine.clientsCount}`);
    console.log(`[${formatDate()}] Hit change stream retries: ${hitChangeStreamRetries}/${maxRetries}`);
    if (hitChangeStreamRetries > 0) {
      console.warn(`[${formatDate()}] Hit change stream is retrying, potential issue with MongoDB connection`);
    }
    // Log active rooms
    const rooms = io.sockets.adapter.rooms;
    console.log(`[${formatDate()}] Active rooms:`, Array.from(rooms.keys()).filter(room => room.startsWith('jackpot:')));
  }, 60000);
}

module.exports = { handleSocketIO };
