const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput  = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoScroll = () => {
    // New message element
    $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)

    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    console.log(newMessageHeight)

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const contentHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(contentHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', ({text: message, createdAt, username}) => {
    console.log(username)
    const html = Mustache.render(messageTemplate, {
        message,
        createdAt: moment(createdAt).format("h:mm a"),
        username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', ({url, createdAt, username}) => {
    const html = Mustache.render($locationTemplate, {
        url,
        createdAt: moment(createdAt).format("h:mm a"),
        username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({users, room}) => {
   const html = Mustache.render($sidebarTemplate, {
       users,
       room
   })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled' , 'disabled')
    const message = $messageFormInput.value
   socket.emit('sendMessage', message, (error) => {
       $messageFormButton.removeAttribute('disabled')
       $messageFormInput.value = ""
       $messageFormInput.focus()
       if(error){
           return console.log(error)
       }
       console.log('Message Delivered!')
   })
})



$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const {coords: {latitude, longitude}} = position
        socket.emit('sendLocation',{latitude, longitude}, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location Shared")
        })
    }, )
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})