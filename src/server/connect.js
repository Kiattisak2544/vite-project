//ใช้สำหรับอ่านค่าจากไฟล์ .env
import dotenv from "dotenv";
//ใช้สำหรับเชื่อมต่อฐานข้อมูล
import { MongoClient } from "mongodb";

// โหลดตัวแปรจากไฟล์ .env
dotenv.config();

const url = process.env.MONGO_URL || "mongodb://localhost:27017";

// ตัวแปรสำหรับเก็บการเชื่อมต่อฐานข้อมูล
let db_con;
let client;

// ฟังก์ชันสำหรับเชื่อมต่อฐานข้อมูล
export async function connectDB() {
    try {
        console.log("⏳ Connecting MongoDB...");

        const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
        client = new MongoClient(mongoUrl);
        await client.connect();

        //เลือกฐานข้อมูล
        db_con = client.db("login_user");

        console.log("================================");
        console.log("🚀 MongoDB CONNECT SUCCESS");
        console.log("📦 DB:", db_con.databaseName);
        console.log("================================");

    } catch (err) {
        console.log("❌ MongoDB FAILED");
        console.log(err.message);
    }
}

// ฟังก์ชันสำหรับเรียกใช้งานฐานข้อมูล
export function getDB() {
    return db_con;
}
