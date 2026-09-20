const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
         u.id, u.name, u.username, u.email, u.bio, u.avatar,
         (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) AS posts_count,
         (SELECT COUNT(*) FROM followers f WHERE f.following_id = u.id) AS followers_count,
         (SELECT COUNT(*) FROM followers f WHERE f.follower_id = u.id) AS following_count
       FROM users u
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load profile." });
  }
});

router.get("/by/:username", auth, async (req, res) => {
  try {
    const username = req.params.username;

    const [users] = await pool.query(
      `SELECT
         u.id, u.name, u.username, u.email, u.bio, u.avatar,
         (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) AS posts_count,
         (SELECT COUNT(*) FROM followers f WHERE f.following_id = u.id) AS followers_count,
         (SELECT COUNT(*) FROM followers f WHERE f.follower_id = u.id) AS following_count,
         EXISTS(
           SELECT 1 FROM followers f
           WHERE f.follower_id = ? AND f.following_id = u.id
         ) AS is_following
       FROM users u
       WHERE u.username = ?`,
      [req.user.id, username]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load user profile." });
  }
});

router.put("/me", auth, async (req, res) => {
  try {
    const { name, bio } = req.body;

    await pool.query(
      "UPDATE users SET name = ?, bio = ? WHERE id = ?",
      [String(name || "").trim(), String(bio || "").trim(), req.user.id]
    );

    res.json({ message: "Profile updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update profile." });
  }
});

module.exports = router;
