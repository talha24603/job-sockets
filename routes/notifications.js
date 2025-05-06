const express = require("express")
const redisUserStore = require("../utils/redisStore")

const notificationRoutes = (io) => {
  const router = express.Router()

  // Create notification API endpoint
  router.post("/notifications", express.json(), async (req, res) => {
    try {
      const { userId, message, type, jobPostId } = req.body

      // Validate required fields
      if (!userId || !message || !type) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      // Here you'd typically save the notification to your database
      // const notification = await saveNotificationToDatabase(userId, message, type, jobPostId);
      const notification = {
        id: Math.random().toString(36).substring(7),
        userId,
        message,
        type,
        jobPostId,
        isRead: false,
        createdAt: new Date().toISOString(),
      }

      // Emit notification to the specific user
      // With Redis adapter, this will work across all server instances
      io.to(`user:${userId}`).emit("notification", notification)

      // Return the notification
      res.status(201).json(notification)
    } catch (error) {
      console.error("Error creating notification:", error)
      res.status(500).json({ error: "Failed to create notification" })
    }
  })

  return router
}

module.exports = notificationRoutes
