const jwt = require("jsonwebtoken");
const Room = require("../models/Room");

const screenSharer = {}; // { [code]: socketId }
const roomState = {}; // { [code]: { url, time, playing, updatedAt } }

module.exports = (io) => {
  io.use((socket, next) => {
    try {
      socket.data.user = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      next();
    } catch { next(new Error("Unauthorized")); }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    socket.on("join-room", async ({ roomCode }) => {
      const room = await Room.findOne({ code: roomCode });
      if (!room) return socket.emit("room-error", "Room not found");
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      if (!roomState[roomCode]) roomState[roomCode] = { url: room.videoUrl, time: 0, playing: false, updatedAt: Date.now() };
      io.to(roomCode).emit("system-message", `${user.name} joined`);
      const sockets = await io.in(roomCode).fetchSockets();
      io.to(roomCode).emit("members", sockets.map((s) => s.data.user.name));
    });

    socket.on("get-state", () => {
      const s = roomState[socket.data.roomCode];
      if (!s) return;
      const time = s.playing ? s.time + (Date.now() - s.updatedAt) / 1000 : s.time;
      socket.emit("room-state", { ...s, time });
    });

    socket.on("chat-message", ({ message }) => {
      const roomCode = socket.data.roomCode;
      if (!roomCode || !message?.trim()) return;
      io.to(roomCode).emit("chat-message", { user: user.name, userId: user.id, message: message.slice(0, 500), time: Date.now() });
    });

    // play | pause | seek | load
    socket.on("video-event", ({ type, time, url }) => {
      const roomCode = socket.data.roomCode;
      const s = roomState[roomCode];
      if (!s) return;
      if (type === "load") { s.url = url; s.time = 0; s.playing = false; }
      else { s.time = time; s.playing = type === "play" ? true : type === "pause" ? false : s.playing; }
      s.updatedAt = Date.now();
      socket.to(roomCode).emit("video-event", { type, time, url, by: user.name });
    });

    // ---- Screen share signaling (one sharer -> many viewers) ----
    socket.on("screen-start", () => {
      const code = socket.data.roomCode;
      if (!code) return;
      if (screenSharer[code] && screenSharer[code] !== socket.id) return socket.emit("screen-busy");
      screenSharer[code] = socket.id;
      socket.to(code).emit("screen-started", { sharerId: socket.id, by: user.name });
    });
    socket.on("screen-stop", () => {
      const code = socket.data.roomCode;
      if (screenSharer[code] === socket.id) {
        delete screenSharer[code];
        socket.to(code).emit("screen-stopped");
      }
    });
    socket.on("screen-query", () => {
      const id = screenSharer[socket.data.roomCode];
      if (id && id !== socket.id) {
        const sharer = io.sockets.sockets.get(id);
        socket.emit("screen-started", { sharerId: id, by: sharer?.data.user.name });
      }
    });
    socket.on("screen-watch", ({ to }) => io.to(to).emit("screen-watch", { from: socket.id }));
    socket.on("screen-offer", ({ to, offer }) => io.to(to).emit("screen-offer", { from: socket.id, offer }));
    socket.on("screen-answer", ({ to, answer }) => io.to(to).emit("screen-answer", { from: socket.id, answer }));
    socket.on("screen-ice", ({ to, candidate }) => io.to(to).emit("screen-ice", { from: socket.id, candidate }));

    // ---- WebRTC signaling (video call, mesh) ----
    socket.on("join-call", async () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;
      const sockets = await io.in(roomCode).fetchSockets();
      const others = sockets.filter((s) => s.id !== socket.id && s.data.inCall).map((s) => s.id);
      socket.data.inCall = true;
      socket.emit("call-users", others);
    });
    socket.on("leave-call", () => {
      socket.data.inCall = false;
      if (socket.data.roomCode) socket.to(socket.data.roomCode).emit("call-left", socket.id);
    });
    socket.on("webrtc-offer", ({ to, offer }) => io.to(to).emit("webrtc-offer", { from: socket.id, offer }));
    socket.on("webrtc-answer", ({ to, answer }) => io.to(to).emit("webrtc-answer", { from: socket.id, answer }));
    socket.on("webrtc-ice", ({ to, candidate }) => io.to(to).emit("webrtc-ice", { from: socket.id, candidate }));

    socket.on("disconnect", async () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;
      if (screenSharer[roomCode] === socket.id) {
        delete screenSharer[roomCode];
        socket.to(roomCode).emit("screen-stopped");
      }
      socket.to(roomCode).emit("call-left", socket.id);
      socket.to(roomCode).emit("system-message", `${user.name} left`);
      const sockets = await io.in(roomCode).fetchSockets();
      io.to(roomCode).emit("members", sockets.map((s) => s.data.user.name));
      if (!sockets.length) { delete roomState[roomCode]; delete screenSharer[roomCode]; }
    });
  });
};