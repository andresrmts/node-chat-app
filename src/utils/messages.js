const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocationMsg = (username, location) => {
  return {
    username,
    text: location,
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMsg
}