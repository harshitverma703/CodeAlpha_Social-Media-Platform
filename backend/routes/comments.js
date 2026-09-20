const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/post/:postId", auth, async (req, res) => {
  try {
    const [comments] = await pool.query(
      `SELECT
         c.id,
         c.comment,
         c.created_at,
         u.id AS user_id,
         u.name,
         u.username,
         u.avatar
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load comments." });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { post_id, comment } = req.body;

    if (!post_id || !comment || !comment.trim()) {
      return res.status(400).json({ message: "Post and comment are required." });
    }

    const [posts] = await pool.query("SELECT id FROM posts WHERE id = ?", [post_id]);

    if (!posts.length) {
      return res.status(404).json({ message: "Post not found." });
    }

    const [result] = await pool.query(
      "INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)",
      [post_id, req.user.id, comment.trim()]
    );

    res.status(201).json({
      message: "Comment added.",
      commentId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not add comment." });
  }
});

module.exports = router;
