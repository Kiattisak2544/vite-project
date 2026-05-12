import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   CONNECT POSTGRESQL
========================= */
const pool = new Pool({
    user: "postgres",
    password: "12345678", // ใส่รหัสที่ถูกต้องตรงนี้
    host: "localhost",
    port: 5433,
    database: "postgres", // เปลี่ยนเป็น "postgres" ก่อนเพื่อทดสอบว่า Login ผ่านไหม
});

/* =========================
   TEST CONNECT
========================= */
pool.connect((err, client, release) => {
    if (err) {
        console.log("❌ Connect PostgreSQL Error :", err.message);
        console.log("💡 Tip: ตรวจสอบว่าเปิด Service Postgres หรือยัง และรหัสผ่านถูกต้องไหม?");
    } else {
        console.log("✅ Connected to PostgreSQL (Port: 5433)");
        release();
    }
});

/* =========================
   START SERVER
========================= */
// แก้จาก process.PORT เป็น 5000
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});