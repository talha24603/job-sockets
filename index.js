require("dotenv").config()
const express = require("express")
const http = require("http")
const cors = require("cors")
const bodyParser = require("body-parser")
const { setupSocketIO } = require("./config/socket")
const notificationRoutes = require("./routes/notifications")

// Create Express app
const app = express()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(bodyParser.json())

// Create HTTP server
const server = http.createServer(app)

// Start the server
const startServer = async () => {
  try {
    // Setup Socket.IO with Redis
    const io = await setupSocketIO(server)

    // Routes
    app.use("/api", notificationRoutes(io))

    // Start server
    const PORT = process.env.PORT || 4000
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Using Redis URL: ${process.env.REDIS_URL}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
