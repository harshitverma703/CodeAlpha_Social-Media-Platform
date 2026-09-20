const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username.trim(), email.trim().toLowerCase()]
    );

    if (existing.length) {
      return res.status(409).json({ message: "Username or email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, username, email, password, bio)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        username.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        "New Saturn user"
      ]
    );

    const user = {
      id: result.insertId,
      username: username.trim()
    };

    const token = createToken(user);

    res.status(201).json({
      message: "Registration successful.",
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: "Login and password are required." });
    }

    const [rows] = await pool.query(
      "SELECT id, name, username, email, password, bio, avatar FROM users WHERE username = ? OR email = ? LIMIT 1",
      [login.trim(), login.trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid login details." });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid login details." });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
});

module.exports = router;
