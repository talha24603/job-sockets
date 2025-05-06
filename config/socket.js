const { Server } = require("socket.io")
const { createAdapter } = require("@socket.io/redis-adapter")
const { createRedisClient } = require("./redis")
const { setupVideoChat } = require("../socket/videoChat")
const { setupNotifications } = require("../socket/notifications")
const { emailToSocketMapping, socketToEmailMapping, userSockets } = require("../utils/maps")

const setupSocketIO = async (server) => {
  // Create Redis clients
  const pubClient = createRedisClient()
  const subClient = pubClient.duplicate()

  // Connect to Redis
  await pubClient.connect()
  await subClient.connect()

  // Create Socket.IO server with Redis adapter
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    adapter: createAdapter(pubClient, subClient),
  })

  // Set up socket handlers
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id)

    // Set up video chat handlers
    setupVideoChat(io, socket, emailToSocketMapping, socketToEmailMapping)

    // Set up notification handlers
    setupNotifications(io, socket, userSockets)

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)

      // Remove from video chat mappings
      const email = socketToEmailMapping.get(socket.id)
      if (email) {
        emailToSocketMapping.delete(email)
        socketToEmailMapping.delete(socket.id)
      }

      // Remove from notification mappings
      for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id)
          if (sockets.size === 0) {
            userSockets.delete(userId)
          }
          break
        }
      }
    })
  })

  return io
}

module.exports = { setupSocketIO }
