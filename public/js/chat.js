const socket = io();
//ELEMENTS
const $chatForm = document.querySelector('#chat-form');
const $chatInput = $chatForm.querySelector('input');
const $chatButton = $chatForm.querySelector('button');
const $geoButton = document.querySelector('#location');
const $messages = document.querySelector('#messages');
//TEMPLATES

const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-url').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


//scrolling
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//LOCATION SHARING EVENT
socket.on('sendLoc', (message) => {
    console.log(message);
    const html = Mustache.render($locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;

})

//MESSAGE  EVENT
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

$chatForm.addEventListener('submit', (e) => {
    //add the method below to prevent the browser from refreshing every time
    e.preventDefault();

    $chatButton.setAttribute('disabled', 'disabled');

    // const message = document.querySelector('input').value;
    const message = e.target.elements.inputMessage.value
    socket.emit('sendMessage', message, (error) => {
        $chatButton.removeAttribute('disabled');
        $chatInput.value = '';
        $chatInput.focus();

        if (error) {
            return console.log(error);
        }
    });
});

$geoButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }
    $geoButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, (ack) => {
            $geoButton.removeAttribute('disabled');
            console.log("Location Shared", ack)
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
    autoscroll();
});