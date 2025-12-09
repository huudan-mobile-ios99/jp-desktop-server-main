const InfoModel = require('../model/information_model');
const HitModel = require('../model/hit_model');

// Utility function for formatting dates
const formatDate = () => new Date().toISOString();

// Handle Socket.IO connections and change streams
function handleSocketIO(io) {
  // Watch for changes in the InformationBroadcast collection
  const broadcastChangeStream = InfoModel.watch([
    { $match: { operationType: 'insert' } } // Only listen for insert operations
  ], { fullDocument: 'updateLookup' });

  // Handle InformationBroadcast change stream events
  broadcastChangeStream.on('change', async (change) => {
    try {
      if (change.operationType === 'insert') {
        const latestBroadcast = change.fullDocument;
        // Emit to all connected clients
        io.emit('broadcast_latest', latestBroadcast);
        // Optionally, emit to clients filtered by jackpotId
        if (latestBroadcast.jackpots && latestBroadcast.jackpots.length > 0) {
          latestBroadcast.jackpots.forEach((jackpot) => {
            io.to(`jackpot:${jackpot.jackpotId}`).emit('broadcast_latest', latestBroadcast);
          });
        }
        console.log(`[${formatDate()}] Emitted latest broadcast:`, latestBroadcast._id);
      }
    } catch (error) {
      console.error(`[${formatDate()}] Error in broadcast change stream:`, error);
    }
  });

  // Handle broadcast change stream errors
  broadcastChangeStream.on('error', (error) => {
    console.error(`[${formatDate()}] Broadcast change stream error:`, error);
    broadcastChangeStream.close();
    console.log(`[${formatDate()}] Broadcast change stream closed due to error`);
  });

  // Watch for changes in the Hits collection
  const hitChangeStream = HitModel.watch([
    { $match: { operationType: 'insert' } } // Only listen for insert operations
  ], { fullDocument: 'updateLookup' });

  // Handle Hits change stream events
  hitChangeStream.on('change', async (change) => {
    try {
      if (change.operationType === 'insert') {
        const latestHit = change.fullDocument;
        // Emit to all connected clients
        io.emit('hit_latest', latestHit);
        // Emit to clients filtered by jackpotId
        io.to(`jackpot:${latestHit.jackpotId}`).emit('hit_latest', latestHit);
        console.log(`[${formatDate()}] Emitted latest hit:`, latestHit._id);
      }
    } catch (error) {
      console.error(`[${formatDate()}] Error in hit change stream:`, error);
    }
  });

  // Handle hit change stream errors
  hitChangeStream.on('error', (error) => {
    console.error(`[${formatDate()}] Hit change stream error:`, error);
    hitChangeStream.close();
    console.log(`[${formatDate()}] Hit change stream closed due to error`);
  });

  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    console.log(`[${formatDate()}] Client connected: ${socket.id}`);

    // Allow clients to subscribe to specific jackpotId updates for broadcasts and hits
    socket.on('subscribe_jackpot', (jackpotId) => {
      if (typeof jackpotId === 'string' && jackpotId) {
        socket.join(`jackpot:${jackpotId}`);
        console.log(`[${formatDate()}] Client ${socket.id} subscribed to jackpotId: ${jackpotId}`);
      }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`[${formatDate()}] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { handleSocketIO };
