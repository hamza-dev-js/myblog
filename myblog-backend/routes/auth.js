const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ تسجيل مستخدم جديد
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "الرجاء إدخال جميع المعلومات" });

  try {
    const [user] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length > 0)
      return res.status(400).json({ message: "هذا البريد مستخدم بالفعل" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .promise()
      .query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [
        username,
        email,
        hashedPassword,
      ]);

    res.status(201).json({ message: "تم إنشاء الحساب بنجاح 🎉" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});

// ✅ تسجيل الدخول
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0)
      return res.status(404).json({ message: "البريد غير مسجل" });

    const validPassword = await bcrypt.compare(password, user[0].password);

    if (!validPassword)
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });

    const token = jwt.sign(
      { id: user[0].id, username: user[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح ✅",
      token,
      user: { id: user[0].id, username: user[0].username },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
});

module.exports = router;
