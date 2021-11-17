const express = require('express')
const http = require('http')
const path = require("path");
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage} = require('./utils/messages')
const { getUser, getUsersInRoom , addUser, removeUser} = require('./utils/user')

const app = express()
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public')


// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    console.log('New web socket connection')


    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        // console.log(error, user);
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Welcome!', "Admin"))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, 'Admin'))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMessage(msg, user.username))
            callback('Delivered!')
        }

    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`, 'Admin'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`, user.username))
            callback()
        }

    })


})

const port = process.env.PORT || 3000


server.listen(port, () => {
    console.log("Server is up on port "+ port)
} )