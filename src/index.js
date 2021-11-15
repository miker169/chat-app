const express = require('express')
const http = require('http')
const path = require("path");
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public')


// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    socket.broadcast.emit('message', 'A new user has arrived')
    console.log('New web socket connection')
    socket.emit('message', 'Welcome!')
    socket.on('sendMessage', (msg) => {
        io.emit('message', msg)
    })
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
    })
})

const port = process.env.PORT || 3000


server.listen(port, () => {
    console.log("Server is up on port "+ port)
} )