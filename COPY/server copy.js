



  const express = require('express');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const app = express();
  const router = express.Router();
  const http = require('http').createServer(app);
  const io = require('socket.io')(http);
  const path = require('path');
  const mongoose = require('mongoose');
  const formatDate = () => new Date().toISOString();


 // Handle uncaught exceptions and promise rejections
  process.on('uncaughtException', (err) => {
    console.error(`[${formatDate()}] Uncaught Exception:`, err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${formatDate()}] Unhandled Rejection at:`, promise, 'reason:', reason);
  });


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
  const routerAPI = require('../APIs/api');
  app.use('/api', routerAPI);

  // MongoDB connections
  const { connectDB } = require('../Mongodb_Service/mongo_config'); // For JPDesktop
  const { connectDBHit } = require('../Mongodb_Service/mongo_config_Hit'); // For JPDesktop_Hit

  //connect 2 more db 
  const {connectDBHitSub} = require('../Mongodb_Service/mongo_config_Sub');
  const {connectDBHitSub2} = require('../Mongodb_Service/mongo_config_Sub2');

   
  const { initializeCleanup } = require('../worker/cleanup');
  const { initializeCleanupHit } = require('../worker/cleanup_hit');

  const { initializeCleanupSub1 } = require('../worker/cleanup_sub1');
  const { initializeCleanupSub2 } = require('../worker/cleanup_sub2');


  //connect 2 more clean up 

   async function initializeDBConnections() {
    try {
      await connectDBHit();
      initializeCleanupHit(mongoose);
      console.log('conected DB hit and init');
    } catch (error) {
      console.log('fail to connect db hit',error)
    }

  try {
      await connectDB();
      initializeCleanup(mongoose);
      console.log('connect DB and init');
    } catch (error) {
      console.log('fail connect db',error)
    }


    //CONNECT 2 MORE DB Subs #CAN BE DISABLE TO USE STABLE VERSION
    try {
      await connectDBHitSub();
      initializeCleanupSub1(mongoose);
      console.log('conected DB SUB 1  and init');
    } catch (error) {
      console.log('fail to connect db sub1',error)
    }
    try {
      await connectDBHitSub2();
      initializeCleanupSub2(mongoose);
      console.log('conected DB SUB 2 and init');
    } catch (error) {
      console.log('fail to connect db sub2',error);
    }
    //END CONNECT 2 MORE DB Subs #CAN BE DISABLE TO USE STABLE VERSION
  }


const { handleBroadcastStreamSUB } = require('../socket_handler_broadcast_Sub');
 try {
      handleBroadcastStreamSUB(io);
    } catch (error) {
      console.log(error);
      return;
}



  // Initialize broadcast and hit streams
  const { handleBroadcastStream } = require('../socket_handler_broadcast');

  try {
      handleBroadcastStream(io);
    } catch (error) {
      console.log(error);
      return;
    }
 
  const { handleHitStream } = require('../socket_handler_hit');
  try {
      handleHitStream(io);
    } catch (error) {
      console.log(error);
      return;
    }


  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`[${formatDate()}] Client connected: ${socket.id}`);
    console.log(`[${formatDate()}] Client ${socket.id} rooms:`, Object.keys(socket.rooms));

    socket.on('subscribe_jackpot', (jackpotId) => {
        try {
            if (typeof jackpotId === 'string' && jackpotId.trim() !== '') {
            socket.join(`jackpot:${jackpotId}`);
            console.log(`[${formatDate()}] Client ${socket.id} subscribed to jackpotId: ${jackpotId}`);
            console.log(`[${formatDate()}] Client ${socket.id} updated rooms:`, Object.keys(socket.rooms));
            } else {
            console.warn(`[${formatDate()}] Invalid jackpotId received from client ${socket.id}:`, jackpotId);
            socket.emit('error', { message: 'Invalid jackpotId' });
            }
        } catch (error) {
            console.error(`[${formatDate()}] Error handling subscribe_jackpot for client ${socket.id}:`, error);
            socket.emit('error', { message: 'Subscription failed' });
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




