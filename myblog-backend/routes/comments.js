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

// 🟢 إضافة تعليق
router.post("/", verifyToken, async (req, res) => {
  const { post_id, content } = req.body;
  if (!post_id || !content)
    return res.status(400).json({ message: "الرجاء إدخال المحتوى ومعرّف المقال" });

  try {
    await db
      .promise()
      .query(
        "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
        [post_id, req.user.id, content]
      );
    res.status(201).json({ message: "تم إضافة التعليق ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة التعليق" });
  }
});

// 🟡 عرض كل التعليقات لمقال معين
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
    res.status(500).json({ message: "حدث خطأ أثناء جلب التعليقات" });
  }
});

// 🔵 تعديل تعليق
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const [comment] = await db.promise().query("SELECT * FROM comments WHERE id = ?", [id]);
    if (comment.length === 0) return res.status(404).json({ message: "التعليق غير موجود" });
    if (comment[0].user_id !== req.user.id)
      return res.status(403).json({ message: "ليس لديك صلاحية التعديل" });

    await db.promise().query("UPDATE comments SET content = ? WHERE id = ?", [content, id]);
    res.json({ message: "تم تعديل التعليق ✅" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء التعديل" });
  }
});

// 🔴 حذف تعليق
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [comment] = await db.promise().query("SELECT * FROM comments WHERE id = ?", [id]);
    if (comment.length === 0) return res.status(404).json({ message: "التعليق غير موجود" });
    if (comment[0].user_id !== req.user.id)
      return res.status(403).json({ message: "ليس لديك صلاحية الحذف" });

    await db.promise().query("DELETE FROM comments WHERE id = ?", [id]);
    res.json({ message: "تم حذف التعليق 🗑️" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
  }
});

module.exports = router;
