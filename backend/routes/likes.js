const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/:postId", auth, async (req, res) => {
  try {
    const postId = Number(req.params.postId);

    const [posts] = await pool.query("SELECT id FROM posts WHERE id = ?", [postId]);

    if (!posts.length) {
      return res.status(404).json({ message: "Post not found." });
    }

    const [existing] = await pool.query(
      "SELECT id FROM likes WHERE post_id = ? AND user_id = ?",
      [postId, req.user.id]
    );

    let liked;

    if (existing.length) {
      await pool.query(
        "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
        [postId, req.user.id]
      );
      liked = false;
    } else {
      await pool.query(
        "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
        [postId, req.user.id]
      );
      liked = true;
    }

    const [count] = await pool.query(
      "SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?",
      [postId]
    );

    res.json({
      liked,
      like_count: Number(count[0].like_count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update like." });
  }
});

module.exports = router;
