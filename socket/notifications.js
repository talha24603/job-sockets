const redisUserStore = require("../utils/redisStore")

const setupNotifications = (io, socket) => {
  socket.on("authenticate", async (userId) => {
    console.log(`User ${userId} authenticated`)

    try {
      // Store user's socket in Redis
      await redisUserStore.addUserSocket(userId, socket.id)
      await redisUserStore.setSocketUser(socket.id, userId)

      // Join user to their own room for targeted notifications
      socket.join(`user:${userId}`)
    } catch (error) {
      console.error("Error storing user socket in Redis:", error)
    }
  })

  socket.on("disconnect", async () => {
    try {
      await redisUserStore.handleDisconnect(socket.id)
    } catch (error) {
      console.error("Error handling disconnect in Redis:", error)
    }
  })
}

module.exports = { setupNotifications }
