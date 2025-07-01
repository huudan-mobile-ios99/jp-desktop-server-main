const express = require('express')
const body_parser = require('body-parser')
const cors = require('cors')
const app = express();
const router = express.Router();
const http = require('http').createServer(app);  // Use the same http instance for express and socket.io
const io = require('socket.io')(http);
const path =require('path');


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser.urlencoded({ extended: false }))
app.use(body_parser.json())
app.use(cors());

const routerAPI = require('./api');
app.use('/api', routerAPI);
//USE MONGODB DATABASE
require('./mongo_config').connectDB();
const { initializeCleanup } = require('./cleanup');
// Initialize cleanup job
initializeCleanup();


const port = process.env.PORT || 8090;
http.listen(port, () => {
    console.log('JP Desktop runnning: ' + port);
});

//USE SOCKET IO
const socketHandler = require('./socket_handler');
socketHandler.handleSocketIO(io);


