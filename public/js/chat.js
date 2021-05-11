const socket = io();

// Elements
const msgForm = document.querySelector('#message-form');
const text = document.querySelector('#textbox');
const button = msgForm.querySelector('button')
const locationbutton = document.querySelector
('#send-location');
const messages = document.querySelector('#messages');

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
  // New message element
  const newMessage = messages.lastElementChild;
  // Height of new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin
  // Visible Height
  const visibleHeight = messages.offsetHeight;
  // Height of messages container
  const containerHeight = messages.scrollHeight;
  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (Math.round(containerHeight - newMessageHeight) <= Math.round(scrollOffset)) {
    messages.scrollTop = messages.scrollHeight;
  }
}

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("HH:mm")
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.text,
    createdAt: moment(location.createdAt).format("HH:mm")
  })
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
})

socket.on('roomData', ({ room, users}) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html;
})

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // disable
  button.setAttribute('disabled', 'disabled')

  socket.emit('sendMessage', text.value, (error) => {
    // reenable
    button.removeAttribute('disabled')
    text.value = '';
    text.focus();
    if (error) {
      return console.log(error)
    }
    console.log('delivered')
  });
})

locationbutton.addEventListener('click', (e) => {
  e.preventDefault();
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }

  locationbutton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    },
    ack => {
      locationbutton.removeAttribute('disabled');
      console.log(ack)
    })
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/'
  }
});