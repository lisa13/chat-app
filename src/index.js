const http = require('http');
const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const Filter = require('bad-words');
const { generateMessage, locationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


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

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }
        socket.join(user.room);

        socket.emit('message', generateMessage('Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
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
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(`'${user.username} has left'`));
        }
    });
});

server.listen(port, () => {
    console.log(`servers up on port ${port}`);
});