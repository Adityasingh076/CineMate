const router = require("express").Router();
const { nanoid } = require("nanoid");
const auth = require("../middleware/auth");
const Room = require("../models/Room");

router.post("/", auth, async (req, res) => {
  try {
    const { name, videoUrl } = req.body;
    if (!name) return res.status(400).json({ message: "Room name required" });
    const room = await Room.create({ code: nanoid(6).toUpperCase(), name, videoUrl: videoUrl || "", host: req.user.id });
    res.json(room);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/:code", auth, async (req, res) => {
  const room = await Room.findOne({ code: req.params.code.toUpperCase() });
  if (!room) return res.status(404).json({ message: "Room not found" });
  res.json(room);
});

module.exports = router;
