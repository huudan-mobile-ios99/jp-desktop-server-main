const InfoModel = require('./model/information_model');

// Utility function for formatting dates
const formatDate = () => new Date().toISOString();

// Handle Socket.IO connections and change streams
function handleSocketIO(io) {
  // Watch for changes in the InformationBroadcast collection
  const changeStream = InfoModel.watch([
    { $match: { operationType: 'insert' } } // Only listen for insert operations
  ], { fullDocument: 'updateLookup' });

  // Handle change stream events
  changeStream.on('change', async (change) => {
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
      console.error(`[${formatDate()}] Error in change stream:`, error);
    }
  });

  // Handle change stream errors
  changeStream.on('error', (error) => {
    console.error(`[${formatDate()}] Change stream error:`, error);
    // Optionally, attempt to restart the change stream
    changeStream.close();
    console.log(`[${formatDate()}] Change stream closed due to error`);
  });

  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    console.log(`[${formatDate()}] Client connected: ${socket.id}`);

    // Allow clients to subscribe to specific jackpotId updates
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
