const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, password });
    res.status(201).json({ token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login };
