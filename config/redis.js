const { createClient } = require("redis")

// Create Redis clients
const createRedisClient = () => {
  // Format the Redis URL properly with protocol prefix
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
  const formattedUrl = redisUrl.startsWith("redis://") ? redisUrl : `redis://${redisUrl}`

  console.log("Connecting to Redis at:", formattedUrl)

  const redisClient = createClient({
    url: formattedUrl,
    password: process.env.REDIS_PASSWORD,
  })

  redisClient.on("error", (err) => {
    console.error("Redis client error:", err)
  })

  redisClient.on("connect", () => {
    console.log("Connected to Redis successfully")
  })

  return redisClient
}

module.exports = { createRedisClient }
