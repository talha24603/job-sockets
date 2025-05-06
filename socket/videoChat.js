const setupVideoChat = (io, socket, emailToSocketMapping, socketToEmailMapping) => {
  socket.on("join-room", (data) => {
    const { roomId, email } = data
    console.log("user", email, "joined room", roomId)
    emailToSocketMapping.set(email, socket.id)
    socketToEmailMapping.set(socket.id, email)
    io.to(socket.id).emit("join-room", data)
    socket.broadcast.to(roomId).emit("user-joined", { email, id: socket.id })
    socket.join(roomId)
  })

  socket.on("call-user", ({ to, offer }) => {
    io.to(to).emit("incoming-call", { from: socket.id, offer })
  })

  socket.on("call-accepted", ({ to, ans }) => {
    io.to(to).emit("call-accepted", { from: socket.id, ans })
  })

  socket.on("peer-nego-needed", ({ to, offer }) => {
    io.to(to).emit("peer-nego-needed", { from: socket.id, offer })
  })

  socket.on("peer-nego-done", ({ to, ans }) => {
    io.to(to).emit("peer-nego-final", { from: socket.id, ans })
  })
}

module.exports = { setupVideoChat }
