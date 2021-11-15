const socket = io()
const messageForm = document.querySelector('#messageForm')

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value
   socket.emit('sendMessage', message)
})

socket.on('message', (msg) => {
    console.log(msg)
})