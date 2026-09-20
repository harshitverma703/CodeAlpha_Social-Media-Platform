const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

async function addPostLikeState(posts, currentUserId) {
  return posts.map((post) => ({
    ...post,
    liked_by_me: Boolean(post.liked_by_me),
    comment_count: Number(post.comment_count),
    like_count: Number(post.like_count)
  }));
}

router.get("/", auth, async (req, res) => {
  try {
    const [posts] = await pool.query(
      `SELECT
         p.id,
         p.content,
         p.image,
         p.created_at,
         u.id AS user_id,
         u.name,
         u.username,
         u.avatar,
         (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
         EXISTS(
           SELECT 1 FROM likes l2
           WHERE l2.post_id = p.id AND l2.user_id = ?
         ) AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json(await addPostLikeState(posts, req.user.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load posts." });
  }
});

router.get("/user/:userId", auth, async (req, res) => {
  try {
    const [posts] = await pool.query(
      `SELECT
         p.id, p.content, p.image, p.created_at,
         u.id AS user_id, u.name, u.username, u.avatar,
         (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
         EXISTS(
           SELECT 1 FROM likes l2
           WHERE l2.post_id = p.id AND l2.user_id = ?
         ) AS liked_by_me
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id, req.params.userId]
    );

    res.json(await addPostLikeState(posts, req.user.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load user posts." });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content is required." });
    }

    const [result] = await pool.query(
      "INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)",
      [req.user.id, content.trim(), image ? image.trim() : null]
    );

    res.status(201).json({
      message: "Post created.",
      postId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create post." });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM posts WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Post not found or not owned by you." });
    }

    res.json({ message: "Post deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete post." });
  }
});

module.exports = router;
