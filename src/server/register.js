import express from "express";
import bcrypt from "bcrypt";
import { getDB } from "./connect.js";

const router = express.Router();

router.post("/server/register", async (req, res) => {
    try {
        const db = getDB();
        const { name, userId, password, confirmPassword } = req.body;

        if (!userId || userId === "") {
            return res.status(400).json({ status: "error", message: "UserId is empty" });
        }

        // เช็ค userId ซ้ำ
        const user = await db.collection("login_user").findOne({ userId });

        if (user) {
            return res.status(400).json({ status: "error", message: "UserId already exists" });
        }

        if (password.length < 8) {
            return res.status(400).json({ status: "error", message: "Password must be at least 8 characters" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ status: "error", message: "Passwords do not match" });
        }

        // เข้ารหัสผ่านด้วย bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // บันทึก user
        await db.collection("login_user").insertOne({
            name,
            userId,
            password: hashedPassword,
            status: "user", // เพิ่มค่า status เป็น user เริ่มต้น,
            time: new Date().toISOString()
        });

        res.json({ status: 201, message: "Register success" });

    } catch (err) {
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

export default router;