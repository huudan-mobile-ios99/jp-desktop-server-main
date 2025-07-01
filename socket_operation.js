const cron = require('node-cron');
const operation_socket = require('./socket_operation');


function handleSocketIO(io) {
    apiSettings.init=false;
    io.off('connection',(socket)=>{
        console.log('off connection');
    });

    io.on('connection', (socket) => {
            console.log('A user connected', socket.id);
        });
}

module.exports = {
    handleSocketIO,
};

