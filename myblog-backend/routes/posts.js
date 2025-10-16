const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// ✅ دالة للتحقق من التوكن
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "لا يوجد توكن" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "توكن غير صالح" });
    req.user = user;
    next();
  });
}

// 🟢 إنشاء مقال جديد
router.post("/", verifyToken, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content)
    return res.status(400).json({ message: "الرجاء إدخال العنوان والمحتوى" });

  try {
    await db
      .promise()
      .query("INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)", [
        req.user.id,
        title,
        content,
      ]);

    res.status(201).json({ message: "تم نشر المقال بنجاح ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء المقال" });
  }
});

// 🟡 جلب كل المقالات
router.get("/", async (req, res) => {
  try {
    const [posts] = await db
      .promise()
      .query(
        "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC"
      );

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب المقالات" });
  }
});

// 🔵 جلب مقال معيّن
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
      return res.status(404).json({ message: "المقال غير موجود" });

    res.json(post[0]);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب المقال" });
  }
});

// 🔵 تعديل مقال
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const [post] = await db
      .promise()
      .query("SELECT * FROM posts WHERE id = ?", [id]);

    if (post.length === 0)
      return res.status(404).json({ message: "المقال غير موجود" });

    if (post[0].user_id !== req.user.id)
      return res.status(403).json({ message: "ليس لديك صلاحية التعديل" });

    await db
      .promise()
      .query("UPDATE posts SET title = ?, content = ? WHERE id = ?", [
        title,
        content,
        id,
      ]);

    res.json({ message: "تم تحديث المقال بنجاح ✅" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء التعديل" });
  }
});

// 🔴 حذف مقال
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [post] = await db
      .promise()
      .query("SELECT * FROM posts WHERE id = ?", [id]);

    if (post.length === 0)
      return res.status(404).json({ message: "المقال غير موجود" });

    if (post[0].user_id !== req.user.id)
      return res.status(403).json({ message: "ليس لديك صلاحية الحذف" });

    await db.promise().query("DELETE FROM posts WHERE id = ?", [id]);

    res.json({ message: "تم حذف المقال بنجاح 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
  }
});

module.exports = router;
