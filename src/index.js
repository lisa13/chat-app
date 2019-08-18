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
const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public/');

app.listen(port);
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

        socket.emit('message', generateMessage("Admin", 'Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filer = new Filter();
        if (filer.isProfane(message)) {
            return callback('Profanities not allowed');
        }
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('sendLocation', (coord, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('sendLoc', locationMessage(user.username, `https://google.com/maps/?q=${coord.lat},${coord.long}`));
        callback('shared');
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `'${user.username} has left'`));

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    });
});

server.listen(port, () => {
    console.log(`servers up on port ${port}`);
});