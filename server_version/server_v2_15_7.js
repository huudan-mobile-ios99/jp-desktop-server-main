  const express = require('express');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const app = express();
  const router = express.Router();
  const http = require('http').createServer(app);
  const io = require('socket.io')(http);
  const path = require('path');

  const formatDate = () => new Date().toISOString();

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Body parser middleware
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  // API routes
  const routerAPI = require('../api');
  app.use('/api', routerAPI);

  // MongoDB connections
  const { connectDB } = require('../mongo_config'); // For JPDesktop
  const { connectDBHit } = require('../mongo_config_Hit'); // For JPDesktop_Hit
  async function initializeDBConnections() {
    await Promise.all([connectDB(), connectDBHit()]);
  }



  // Initialize broadcast and hit streams
  const { handleBroadcastStream } = require('../socket_handler_broadcast');
  handleBroadcastStream(io);
  const { handleHitStream } = require('../socket_handler_hit');
  handleHitStream(io);


  // Cleanup job
  const { initializeCleanup } =  require('../worker/cleanup');
  initializeCleanup();
  // Cleanup job HIt
  const { initializeCleanupHit } = require('../worker/cleanup_hit');
  initializeCleanupHit();

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`[${formatDate()}] Client connected: ${socket.id}`);
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

  // Start server
  async function startServer() {
    await initializeDBConnections();
    const port = process.env.PORT || 8103;
    http.listen(port, () => {
      console.log(`[${formatDate()}] MY SERVER RUNNING: ${port}`);
    });
  }

  startServer();




