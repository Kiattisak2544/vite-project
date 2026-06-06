import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import dns from "dns";


dotenv.config();

// 🔥 เพิ่ม DNS fix ตรงนี้
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const url = process.env.MONGO_URL || "mongodb://localhost:27017";

let db_con;
let client;


export async function connectDB() {
    try {
        // console.log("⏳ Connecting MongoDB...");

        // console.log("Mongo URL:", url);

        client = new MongoClient(url);
        await client.connect();



        db_con = client.db("login_user");

        console.log("🚀 MongoDB CONNECT SUCCESS");
        console.log("📦 DB:", db_con.databaseName);

    } catch (err) {
        console.log("❌ MongoDB FAILED");
        console.log(err.message);
    }
}

export function getDB() {
    return db_con;
}