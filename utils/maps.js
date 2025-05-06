// Maps for video chat
const emailToSocketMapping = new Map()
const socketToEmailMapping = new Map()

// Map for notifications
const userSockets = new Map()

module.exports = {
  emailToSocketMapping,
  socketToEmailMapping,
  userSockets,
}
