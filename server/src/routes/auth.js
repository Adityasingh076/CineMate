const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const sign = (u) => jwt.sign({ id: u._id, name: u.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be 6+ characters" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: "Email already in use" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.json({ token: sign(user), user: pub(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password)))
      return res.status(400).json({ message: "Invalid credentials" });
    res.json({ token: sign(user), user: pub(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
