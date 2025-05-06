const { createRedisClient } = require("../config/redis")

class RedisUserStore {
  constructor() {
    this.redisClient = createRedisClient()
    this.init()
  }

  async init() {
    await this.redisClient.connect()
  }

  // Store user socket mapping
  async addUserSocket(userId, socketId) {
    await this.redisClient.sAdd(`user:${userId}:sockets`, socketId)
  }

  // Remove user socket mapping
  async removeUserSocket(userId, socketId) {
    await this.redisClient.sRem(`user:${userId}:sockets`, socketId)

    // Check if user has any sockets left
    const socketCount = await this.redisClient.sCard(`user:${userId}:sockets`)
    if (socketCount === 0) {
      // Clean up user data if no sockets remain
      await this.redisClient.del(`user:${userId}:sockets`)
    }
  }

  // Find user by socket ID
  async findUserBySocket(socketId) {
    // This is a more complex operation in Redis
    // We need to scan all user:*:sockets sets to find the socketId
    // For simplicity, we'll maintain a reverse mapping
    const userId = await this.redisClient.get(`socket:${socketId}:user`)
    return userId
  }

  // Store socket to user mapping (for reverse lookup)
  async setSocketUser(socketId, userId) {
    await this.redisClient.set(`socket:${socketId}:user`, userId)
  }

  // Remove socket to user mapping
  async removeSocketUser(socketId) {
    await this.redisClient.del(`socket:${socketId}:user`)
  }

  // Get all socket IDs for a user
  async getUserSockets(userId) {
    return await this.redisClient.sMembers(`user:${userId}:sockets`)
  }

  // Clean up on disconnect
  async handleDisconnect(socketId) {
    const userId = await this.findUserBySocket(socketId)
    if (userId) {
      await this.removeUserSocket(userId, socketId)
      await this.removeSocketUser(socketId)
    }
  }
}

module.exports = new RedisUserStore()
