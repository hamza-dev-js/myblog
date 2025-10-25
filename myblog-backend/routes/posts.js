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

// 🟢 Create a new post
router.post("/", verifyToken, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content)
    return res.status(400).json({ message: "Please provide title and content" });

  try {
    await db
      .promise()
      .query("INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)", [
        req.user.id,
        title,
        content,
      ]);

    res.status(201).json({ message: "Post created successfully ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred while creating the post" });
  }
});

// 🟡 Get all posts
router.get("/", async (req, res) => {
  try {
    const [posts] = await db
      .promise()
      .query(
        "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC"
      );

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while fetching posts" });
  }
});

// 🔵 Get a specific post
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [post] = await db
      .promise()
      .query(
        "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?",
        [id]
      );

    if (post.length === 0)
      return res.status(404).json({ message: "Post not found" });

    res.json(post[0]);
  } catch (error) {
    res.status(500).json({ message: "Error occurred while fetching the post" });
  }
});

// 🔵 Update a post
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const [post] = await db
      .promise()
      .query("SELECT * FROM posts WHERE id = ?", [id]);

    if (post.length === 0)
      return res.status(404).json({ message: "Post not found" });

    if (post[0].user_id !== req.user.id)
      return res.status(403).json({ message: "You do not have permission to edit" });

    await db
      .promise()
      .query("UPDATE posts SET title = ?, content = ? WHERE id = ?", [
        title,
        content,
        id,
      ]);

    res.json({ message: "Post updated successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while updating" });
  }
});

// 🔴 Delete a post
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [post] = await db
      .promise()
      .query("SELECT * FROM posts WHERE id = ?", [id]);

    if (post.length === 0)
      return res.status(404).json({ message: "Post not found" });

    if (post[0].user_id !== req.user.id)
      return res.status(403).json({ message: "You do not have permission to delete" });

    await db.promise().query("DELETE FROM posts WHERE id = ?", [id]);

    res.json({ message: "Post deleted successfully 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while deleting" });
  }
});

module.exports = router;
