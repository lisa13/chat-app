const http = require('http');
const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const Filter = require('bad-words');
const { generateMessage, locationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.port || 3000;
const publicDirectory = path.join(__dirname, '../public/');


app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
    //socket.emit, io.emit, socket.broadcast.emit
    //io.to.emit- emitsn an event to everyone in a specific room
    //socket.broacats.to.emit- sends an event to everyone limiting to a specific chatroom

    socket.on('join', ({ username, room }) => {
        socket.join(room);

        socket.emit('message', generateMessage('Welcome'));
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));
    });

    socket.on('sendMessage', (message, callback) => {
        const filer = new Filter();
        if (filer.isProfane(message)) {
            return callback('Profanities not allowed');
        }
        io.emit('message', generateMessage(message));
        callback();
    });

    socket.on('sendLocation', (coord, callback) => {
        io.emit('sendLoc', locationMessage(`https://google.com/maps/?q=${coord.lat},${coord.long}`));
        callback('shared');
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user just left'));
    });
});

server.listen(port, () => {
    console.log(`servers up on port ${port}`);
});