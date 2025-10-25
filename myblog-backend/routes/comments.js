const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// ✅ Function to verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// 🟢 Add a comment
router.post("/", verifyToken, async (req, res) => {
  const { post_id, content } = req.body;
  if (!post_id || !content)
    return res.status(400).json({ message: "Please provide content and post ID" });

  try {
    await db
      .promise()
      .query(
        "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
        [post_id, req.user.id, content]
      );
    res.status(201).json({ message: "Comment added ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred while adding the comment" });
  }
});

// 🟡 Get all comments for a specific post
router.get("/:post_id", async (req, res) => {
  const { post_id } = req.params;
  try {
    const [comments] = await db
      .promise()
      .query(
        "SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ? ORDER BY created_at ASC",
        [post_id]
      );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while fetching comments" });
  }
});

// 🔵 Edit a comment
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const [comment] = await db.promise().query("SELECT * FROM comments WHERE id = ?", [id]);
    if (comment.length === 0) return res.status(404).json({ message: "Comment not found" });
    if (comment[0].user_id !== req.user.id)
      return res.status(403).json({ message: "You do not have permission to edit" });

    await db.promise().query("UPDATE comments SET content = ? WHERE id = ?", [content, id]);
    res.json({ message: "Comment updated ✅" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while updating" });
  }
});

// 🔴 Delete a comment
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [comment] = await db.promise().query("SELECT * FROM comments WHERE id = ?", [id]);
    if (comment.length === 0) return res.status(404).json({ message: "Comment not found" });
    if (comment[0].user_id !== req.user.id)
      return res.status(403).json({ message: "You do not have permission to delete" });

    await db.promise().query("DELETE FROM comments WHERE id = ?", [id]);
    res.json({ message: "Comment deleted 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while deleting" });
  }
});

module.exports = router;
