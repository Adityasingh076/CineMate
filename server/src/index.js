require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const app = express();

// Allow flexible origins for local network testing (or fallback to your env)
app.use(cors({
  origin: true, // Dynamically allows whatever frontend URL/IP is making the request
  credentials: true
}));

app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/rooms", require("./routes/rooms"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

require("./socket")(io);

connectDB()
  .then(() => server.listen(process.env.PORT || 5000, () => console.log("Server running on", process.env.PORT || 5000)))
  .catch((e) => { console.error("DB error:", e.message); process.exit(1); });