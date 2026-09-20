const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/:userId", auth, async (req, res) => {
  try {
    const targetId = Number(req.params.userId);

    if (!targetId || targetId === req.user.id) {
      return res.status(400).json({ message: "You cannot follow this user." });
    }

    const [users] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [targetId]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found." });
    }

    const [existing] = await pool.query(
      "SELECT id FROM followers WHERE follower_id = ? AND following_id = ?",
      [req.user.id, targetId]
    );

    if (existing.length) {
      await pool.query(
        "DELETE FROM followers WHERE follower_id = ? AND following_id = ?",
        [req.user.id, targetId]
      );
      return res.json({ following: false });
    }

    await pool.query(
      "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)",
      [req.user.id, targetId]
    );

    res.json({ following: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update follow status." });
  }
});

module.exports = router;
