import express from "express";
import bcrypt from "bcrypt";
import { getDB } from "./connect.js";

const router = express.Router();

router.post("/server/login", async (req, res) => {
    try {
        const db = getDB();
        const { userId, password } = req.body;

        if (!userId || userId === "") {
            return res.status(400).json({ status: "error", message: "UserId is empty" });
        }

        // เช็ค userId
        const user = await db.collection("login_user").findOne({ userId });

        if (!user) {
            return res.status(400).json({ status: "error", message: "User not found" });
        }

        // เช็ค password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ status: "error", message: "Invalid password" });
        }

        res.json({
            status: "ok",
            message: "Login success",
            user: {
                name: user.name,
                userId: user.userId,
                status: user.status,
                time: new Date().toISOString()
            }
        });

    } catch (err) {
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

export default router;